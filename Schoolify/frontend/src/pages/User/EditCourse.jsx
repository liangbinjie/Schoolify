import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import axios from "axios";

function EditCourse() {
    const { courseId } = useParams(); // Obtener el ID del curso desde la URL
    const [activeSection, setActiveSection] = useState("general"); // Controlar la sección activa
    const [courseName, setCourseName] = useState(""); // Para mostrar el nombre del curso en el título

    // Función para cambiar de sección
    const handleSectionChange = (section) => {
        setActiveSection(section);
    };

    useEffect(() => {
        // Obtener el nombre del curso para el título
        const fetchCourseName = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/courses/${courseId}`);
                setCourseName(response.data.name);
            } catch (error) {
                console.error("Error al obtener el nombre del curso:", error);
            }
        };

        fetchCourseName();
    }, [courseId]);

    return (
        <div className="container my-5">
            <h1 className="text-center mb-4">Editando: {courseName}</h1>

            {/* Navbar de navegación */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeSection === "general" ? "active" : ""}`}
                        onClick={() => handleSectionChange("general")}
                    >
                        General
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeSection === "topics" ? "active" : ""}`}
                        onClick={() => handleSectionChange("topics")}
                    >
                        Temas y Subtemas
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeSection === "evaluations" ? "active" : ""}`}
                        onClick={() => handleSectionChange("evaluations")}
                    >
                        Evaluaciones
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeSection === "students" ? "active" : ""}`}
                        onClick={() => handleSectionChange("students")}
                    >
                        Estudiantes
                    </button>
                </li>
            </ul>

            {/* Contenido de las secciones */}
            {activeSection === "general" && <GeneralSection courseId={courseId} />}
            {activeSection === "topics" && <TopicsSection courseId={courseId} />}
            {activeSection === "evaluations" && <EvaluationsSection courseId={courseId} />}
            {activeSection === "students" && <StudentsSection courseId={courseId} />}
        </div>
    );
}

function GeneralSection({ courseId }) {
    const navigate = useNavigate(); // Para redirigir después de guardar cambios
    const [courseData, setCourseData] = useState({
        name: "",
        code: "",
        description: "",
        startDate: "",
        endDate: "",
        state: "in edition",
        image: null,
    });
    const [currentImageUrl, setCurrentImageUrl] = useState(null);
    const [imageFileName, setImageFileName] = useState("");

    // Obtener los datos del curso al montar el componente
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/courses/${courseId}`);
                const data = response.data;
                
                setCourseData({
                    name: data.name,
                    code: data.code,
                    description: data.description,
                    startDate: data.startDate ? data.startDate.split("T")[0] : "",
                    endDate: data.endDate ? data.endDate.split("T")[0] : "",
                    state: data.state,
                    image: null,
                });

                // Verificar si el curso tiene una imagen
                if (data.image && data.image.contentType) {
                    // Añadir timestamp para evitar problemas de caché
                    const imageUrl = `http://localhost:5000/courses/${courseId}/image?${new Date().getTime()}`;
                    setCurrentImageUrl(imageUrl);
                    
                    // Crear un nombre de archivo sugerido para la descarga
                    const extension = data.image.contentType.split('/')[1] || 'png';
                    setImageFileName(`curso_${data.code}_imagen.${extension}`);
                }
            } catch (error) {
                console.error("Error al obtener los datos del curso:", error);
            }
        };

        fetchCourseData();
    }, [courseId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourseData({ ...courseData, [name]: value });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCourseData({ ...courseData, image: file });
            
            // Crear una URL temporal para previsualizar la nueva imagen
            setCurrentImageUrl(URL.createObjectURL(file));
            setImageFileName(file.name);
        }
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append("name", courseData.name);
            formData.append("code", courseData.code);
            formData.append("description", courseData.description);
            formData.append("startDate", courseData.startDate);
            formData.append("endDate", courseData.endDate);
            formData.append("state", courseData.state);
            if (courseData.image) {
                formData.append("image", courseData.image);
            }

            await axios.put(`http://localhost:5000/courses/${courseId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("Curso actualizado con éxito");
            
            // Actualizar la URL de la imagen después de guardar
            if (courseData.image) {
                const newImageUrl = `http://localhost:5000/courses/${courseId}/image?${new Date().getTime()}`;
                setCurrentImageUrl(newImageUrl);
                // Limpiar el estado del archivo después de guardar
                setCourseData(prev => ({...prev, image: null}));
            }
        } catch (error) {
            console.error("Error al actualizar el curso:", error);
        }
    };

    const downloadImage = async () => {
        try {
            // Hacer la solicitud para obtener la imagen
            const response = await fetch(`http://localhost:5000/courses/${courseId}/image`);
            
            if (!response.ok) {
                throw new Error('Error al descargar la imagen');
            }
            
            // Convertir la respuesta a un blob
            const blob = await response.blob();
            
            // Crear una URL para el blob
            const blobUrl = URL.createObjectURL(blob);
            
            // Crear un elemento <a> temporal
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = imageFileName; // Usar el nombre de archivo que ya tenemos
            
            // Simular un clic en el enlace para forzar la descarga
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Liberar la URL del blob cuando ya no sea necesaria
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
            
        } catch (error) {
            console.error('Error al descargar la imagen:', error);
            alert('No se pudo descargar la imagen');
        }
    };

    return (
        <div>
            <h2>Editar Información General</h2>
            <form>
                <div className="mb-3">
                    <label className="form-label">Nombre del Curso</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={courseData.name}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Código del Curso</label>
                    <input
                        type="text"
                        className="form-control"
                        name="code"
                        value={courseData.code}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                        className="form-control"
                        name="description"
                        value={courseData.description}
                        onChange={handleInputChange}
                    ></textarea>
                </div>
                <div className="mb-3">
                    <label className="form-label">Fecha de Inicio</label>
                    <input
                        type="date"
                        className="form-control"
                        name="startDate"
                        value={courseData.startDate}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Fecha de Finalización</label>
                    <input
                        type="date"
                        className="form-control"
                        name="endDate"
                        value={courseData.endDate}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Estado</label>
                    <select
                        className="form-select"
                        name="state"
                        value={courseData.state}
                        onChange={handleInputChange}
                    >
                        <option value="in edition">Editando</option>
                        <option value="published">Publicado</option>
                        <option value="active">Activo</option>
                        <option value="closed">Cerrado</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Imagen del Curso</label>
                    
                    {/* Mostrar la imagen actual si existe */}
                    {currentImageUrl && (
                        <div className="mb-3">
                            <img 
                                src={currentImageUrl} 
                                alt="Imagen del curso" 
                                style={{
                                    maxWidth: "200px", 
                                    maxHeight: "150px", 
                                    display: "block",
                                    marginBottom: "10px"
                                }} 
                            />
                        </div>
                    )}
                    
                    <input
                        type="file"
                        className="form-control mb-2"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    
                    {/* Botón de descarga si hay una imagen guardada */}
                    {currentImageUrl && !courseData.image && (
                        <button 
                            onClick={downloadImage}
                            className="btn btn-outline-primary btn-sm mb-3"
                            type="button"
                        >
                            <i className="bi bi-download me-1"></i> Descargar imagen actual
                        </button>
                    )}
                </div>
                <button type="button" className="btn btn-primary" onClick={handleSave}>
                    Guardar Cambios
                </button>
            </form>
        </div>
    );
}

function TopicsSection({ courseId }) {
    const [topics, setTopics] = useState([]);
    const [newTopic, setNewTopic] = useState({ title: "", description: "", order: 1, contents: [] });
    const [newSubtopic, setNewSubtopic] = useState({ title: "", description: "", order: 1 });
    const [expandedTopicId, setExpandedTopicId] = useState(null);
    const [editingTopic, setEditingTopic] = useState(null);
    const [editingSubtopic, setEditingSubtopic] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);

    const startEditingTopic = (topic) => {
        setEditingTopic({
            _id: topic._id,
            title: topic.title,
            description: topic.description,
            order: topic.order
        });
    };

    const startEditingSubtopic = (subtopic) => {
        setEditingSubtopic({
            _id: subtopic._id,
            topicId: subtopic.topicId,
            title: subtopic.title,
            description: subtopic.description,
            order: subtopic.order
        });
    };

    const cancelEditingTopic = () => {
        setEditingTopic(null);
    };

    const cancelEditingSubtopic = () => {
        setEditingSubtopic(null);
    };

    const handleEditTopicChange = (e) => {
        const { name, value } = e.target;
        setEditingTopic(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditSubtopicChange = (e) => {
        const { name, value } = e.target;
        setEditingSubtopic(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const saveEditedTopic = async () => {
        try {
            await axios.put(`http://localhost:5000/api/tabs/courses/${courseId}/tabs/${editingTopic._id}`, {
                title: editingTopic.title,
                description: editingTopic.description,
                order: editingTopic.order,
            });

            setTopics(topics.map(topic =>
                topic._id === editingTopic._id
                    ? { ...topic, ...editingTopic }
                    : topic
            ));

            setEditingTopic(null);
            alert("Tema actualizado correctamente");
        } catch (error) {
            console.error("Error al actualizar el tema:", error);
            alert("Error al actualizar el tema");
        }
    };

    const saveEditedSubtopic = async () => {
        try {
            await axios.put(
                `http://localhost:5000/api/tabs/courses/${courseId}/tabs/${editingSubtopic.topicId}/subtabs/${editingSubtopic._id}`,
                {
                    title: editingSubtopic.title,
                    description: editingSubtopic.description,
                    order: editingSubtopic.order,
                }
            );

            const updatedTopics = topics.map(topic =>
                topic._id === editingSubtopic.topicId
                    ? {
                          ...topic,
                          subtabs: topic.subtabs.map(subtab =>
                              subtab._id === editingSubtopic._id
                                  ? { ...subtab, ...editingSubtopic }
                                  : subtab
                          ),
                      }
                    : topic
            );

            setTopics(updatedTopics);
            setEditingSubtopic(null);
            alert("Subtema actualizado correctamente");
        } catch (error) {
            console.error("Error al actualizar el subtema:", error);
            alert("Error al actualizar el subtema");
        }
    };

    const loadTopicFiles = async (topicId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/cassandra-files/list/topic/${courseId}/${topicId}`);
            setUploadedFiles(prev => ({
                ...prev,
                [topicId]: response.data
            }));
        } catch (error) {
            console.error("Error al cargar archivos:", error);
        }
    };

    const loadSubtopicFiles = async (topicId, subtopicId) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/cassandra-files/list/subtopic/${courseId}/${topicId}/${subtopicId}`
            );
            setUploadedFiles(prev => ({
                ...prev,
                [`${topicId}_${subtopicId}`]: response.data
            }));
        } catch (error) {
            console.error("Error al cargar archivos de subtema:", error);
        }
    };

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/tabs/courses/${courseId}/tabs`);
                setTopics(response.data);
                
                response.data.forEach(topic => {
                    loadTopicFiles(topic._id);
                    
                    if (topic.subtabs && topic.subtabs.length > 0) {
                        topic.subtabs.forEach(subtab => {
                            loadSubtopicFiles(topic._id, subtab._id);
                        });
                    }
                });
            } catch (error) {
                console.error("Error al obtener los temas:", error);
            }
        };

        fetchTopics();
    }, [courseId]);

    const toggleTopic = (topicId) => {
        setExpandedTopicId((prevId) => (prevId === topicId ? null : topicId));
    };

    const handleTopicInputChange = (e) => {
        const { name, value } = e.target;
        setNewTopic({ ...newTopic, [name]: value });
    };

    const handleSubtopicInputChange = (e) => {
        const { name, value } = e.target;
        setNewSubtopic({ ...newSubtopic, [name]: value });
    };

    const handleTopicFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const uploadFileToTopic = async (topicId) => {
        if (!selectedFile) {
            alert("Por favor seleccione un archivo para subir");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("title", selectedFile.name);
            formData.append("uploadedBy", "current_user");

            const response = await axios.post(
                `http://localhost:5000/api/cassandra-files/upload/topic/${courseId}/${topicId}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            loadTopicFiles(topicId);
            setSelectedFile(null);
            alert("Archivo subido correctamente a Cassandra");
        } catch (error) {
            console.error("Error al subir archivo:", error);
            alert(`Error al subir el archivo: ${error.response?.data?.message || error.message}`);
        }
    };

    const uploadFileToSubtopic = async (topicId, subtopicId) => {
        if (!selectedFile) {
            alert("Por favor seleccione un archivo para subir");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("title", selectedFile.name);
            formData.append("uploadedBy", "current_user");

            const response = await axios.post(
                `http://localhost:5000/api/cassandra-files/upload/subtopic/${courseId}/${topicId}/${subtopicId}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            loadSubtopicFiles(topicId, subtopicId);
            setSelectedFile(null);
            alert("Archivo subido correctamente al subtema en Cassandra");
        } catch (error) {
            console.error("Error al subir archivo al subtema:", error);
            alert(`Error al subir el archivo al subtema: ${error.response?.data?.message || error.message}`);
        }
    };

    const downloadFile = (fileId, fileName) => {
        window.open(`http://localhost:5000/api/cassandra-files/download/${fileId}`, '_blank');
    };

    const deleteFileFromTab = async (topicId, fileId) => {
        try {
            await axios.delete(`http://localhost:5000/api/cassandra-files/delete/${fileId}`);
            loadTopicFiles(topicId);
            alert("Archivo eliminado correctamente");
        } catch (error) {
            console.error("Error al eliminar archivo:", error);
            alert("Error al eliminar archivo");
        }
    };

    const deleteFileFromSubtab = async (topicId, subtopicId, fileId) => {
        try {
            await axios.delete(`http://localhost:5000/api/cassandra-files/delete/${fileId}`);
            loadSubtopicFiles(topicId, subtopicId);
            alert("Archivo eliminado correctamente");
        } catch (error) {
            console.error("Error al eliminar archivo del subtema:", error);
            alert("Error al eliminar archivo del subtema");
        }
    };

    const saveTopic = async () => {
        try {
            const formData = new FormData();
            formData.append("title", newTopic.title);
            formData.append("description", newTopic.description);
            formData.append("order", newTopic.order);

            newTopic.contents.forEach((file) => formData.append("contents", file));

            const response = await axios.post(
                `http://localhost:5000/api/tabs/courses/${courseId}/tabs`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            const newTopicData = response.data.tab;
            setTopics([...topics, newTopicData]);
            setNewTopic({ title: "", description: "", order: 1, contents: [] });

            alert("Tema creado exitosamente");
        } catch (error) {
            console.error("Error al guardar el tema:", error);
            alert("Error al guardar el tema");
        }
    };

    const saveSubtopic = async (topicId) => {
        try {
            const response = await axios.post(
                `http://localhost:5000/api/tabs/courses/${courseId}/tabs/${topicId}/subtabs`,
                {
                    title: newSubtopic.title,
                    description: newSubtopic.description,
                    order: newSubtopic.order,
                }
            );

            const updatedTopics = topics.map((topic) =>
                topic._id === topicId
                    ? { ...topic, subtabs: [...topic.subtabs, response.data.subtab] }
                    : topic
            );

            setTopics(updatedTopics);
            setNewSubtopic({ title: "", description: "", order: 1 });

            alert("Subtema creado exitosamente");
        } catch (error) {
            console.error("Error al guardar el subtema:", error);
            alert("Error al guardar el subtema");
        }
    };

    return (
        <div>
            <h2>Temas</h2>

            <div className="card mb-4">
                <div className="card-header">Agregar Tema</div>
                <div className="card-body">
                    <div className="mb-3">
                        <label className="form-label">Título</label>
                        <input
                            type="text"
                            className="form-control"
                            name="title"
                            value={newTopic.title}
                            onChange={handleTopicInputChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Descripción</label>
                        <textarea
                            className="form-control"
                            name="description"
                            value={newTopic.description}
                            onChange={handleTopicInputChange}
                        ></textarea>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Orden</label>
                        <input
                            type="number"
                            className="form-control"
                            name="order"
                            value={newTopic.order}
                            onChange={handleTopicInputChange}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={saveTopic}>
                        Guardar Tema
                    </button>
                </div>
            </div>

            {topics.length > 0 ? (
                topics.map((topic) => (
                    <div key={topic._id} className="card mb-3">
                        <div className="card-header d-flex justify-content-between">
                            <span>{topic.title}</span>
                            <div>
                                <button
                                    className="btn btn-link"
                                    onClick={() => toggleTopic(topic._id)}
                                >
                                    {expandedTopicId === topic._id ? "Ocultar" : "Mostrar"}
                                </button>
                                <button
                                    className="btn btn-warning btn-sm ms-2"
                                    onClick={() => startEditingTopic(topic)}
                                >
                                    Editar
                                </button>
                            </div>
                        </div>
                        {expandedTopicId === topic._id && (
                            <div className="card-body">
                                <p>{topic.description}</p>
                                
                                <div className="mb-4">
                                    <h5>Archivos del tema</h5>
                                    <div className="mb-3">
                                        <input
                                            type="file"
                                            className="form-control mb-2"
                                            onChange={handleTopicFileChange}
                                        />
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => uploadFileToTopic(topic._id)}
                                        >
                                            Subir Archivo
                                        </button>
                                    </div>
                                    
                                    {uploadedFiles[topic._id] && uploadedFiles[topic._id].length > 0 ? (
                                        <ul className="list-group">
                                            {uploadedFiles[topic._id].map(file => (
                                                <li key={file.file_id} className="list-group-item d-flex justify-content-between align-items-center">
                                                    {file.filename}
                                                    <div>
                                                        <button
                                                            className="btn btn-primary btn-sm me-2"
                                                            onClick={() => downloadFile(file.file_id, file.filename)}
                                                        >
                                                            <i className="bi bi-download"></i> Descargar
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => deleteFileFromTab(topic._id, file.file_id)}
                                                        >
                                                            <i className="bi bi-trash"></i> Eliminar
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No hay archivos subidos para este tema.</p>
                                    )}
                                </div>
                                
                                <h5>Subtemas</h5>
                                <ul className="list-group mb-3">
                                    {(topic.subtabs || []).map((subtab) => (
                                        <li key={subtab._id} className="list-group-item">
                                            <div className="d-flex justify-content-between mb-2">
                                                <div>
                                                    <strong>{subtab.title}</strong>
                                                    <p className="text-muted mb-0">{subtab.description}</p> {/* Mostrar descripción */}
                                                </div>
                                                <button
                                                    className="btn btn-warning btn-sm"
                                                    onClick={() => startEditingSubtopic({...subtab, topicId: topic._id})}
                                                >
                                                    Editar
                                                </button>
                                            </div>
                                            <div className="mt-2">
                                                <h6>Archivos del subtema</h6>
                                                <div className="mb-3">
                                                    <input
                                                        type="file"
                                                        className="form-control mb-2"
                                                        onChange={handleTopicFileChange}
                                                    />
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => uploadFileToSubtopic(topic._id, subtab._id)}
                                                    >
                                                        Subir Archivo
                                                    </button>
                                                </div>
                                                {uploadedFiles[`${topic._id}_${subtab._id}`] && uploadedFiles[`${topic._id}_${subtab._id}`].length > 0 ? (
                                                    <ul className="list-group">
                                                        {uploadedFiles[`${topic._id}_${subtab._id}`].map(file => (
                                                            <li key={file.file_id} className="list-group-item d-flex justify-content-between align-items-center">
                                                                {file.filename}
                                                                <div>
                                                                    <button
                                                                        className="btn btn-primary btn-sm me-2"
                                                                        onClick={() => downloadFile(file.file_id, file.filename)}
                                                                    >
                                                                        <i className="bi bi-download"></i> Descargar
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-danger btn-sm"
                                                                        onClick={() => deleteFileFromSubtab(topic._id, subtab._id, file.file_id)}
                                                                    >
                                                                        <i className="bi bi-trash"></i> Eliminar
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p>No hay archivos subidos para este subtema.</p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {/* Formulario para agregar subtemas */}
                                <div className="card mb-4">
                                    <div className="card-header">Agregar Subtema</div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <label className="form-label">Título</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="title"
                                                value={newSubtopic.title}
                                                onChange={(e) =>
                                                    setNewSubtopic({ ...newSubtopic, title: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Descripción</label>
                                            <textarea
                                                className="form-control"
                                                name="description"
                                                value={newSubtopic.description}
                                                onChange={(e) =>
                                                    setNewSubtopic({ ...newSubtopic, description: e.target.value })
                                                }
                                            ></textarea>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Orden</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="order"
                                                value={newSubtopic.order}
                                                onChange={(e) =>
                                                    setNewSubtopic({ ...newSubtopic, order: e.target.value })
                                                }
                                            />
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => saveSubtopic(topic._id)}
                                        >
                                            Guardar Subtema
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p>No hay temas disponibles.</p>
            )}

            {editingTopic && (
                <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Editar Tema</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={cancelEditingTopic}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Título</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="title"
                                        value={editingTopic.title}
                                        onChange={handleEditTopicChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Descripción</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        value={editingTopic.description}
                                        onChange={handleEditTopicChange}
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Orden</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="order"
                                        value={editingTopic.order}
                                        onChange={handleEditTopicChange}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={cancelEditingTopic}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={saveEditedTopic}
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editingSubtopic && (
                <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Editar Subtema</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={cancelEditingSubtopic}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Título</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="title"
                                        value={editingSubtopic.title}
                                        onChange={handleEditSubtopicChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Descripción</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        value={editingSubtopic.description}
                                        onChange={handleEditSubtopicChange}
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Orden</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="order"
                                        value={editingSubtopic.order}
                                        onChange={handleEditSubtopicChange}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={cancelEditingSubtopic}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={saveEditedSubtopic}
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function EvaluationsSection({ courseId }) {
    const { user } = useAuth();
    const [evaluations, setEvaluations] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedEvaluation, setSelectedEvaluation] = useState(null);
    const [editEvaluation, setEditEvaluation] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: ""
    });
    const [newEvaluation, setNewEvaluation] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: ""
    });
    const [newQuestion, setNewQuestion] = useState({
        questionText: "",
        options: ["", "", "", ""],
        correctOption: 0
    });
    const [showResults, setShowResults] = useState(false);
    const [evaluationResults, setEvaluationResults] = useState([]);

    useEffect(() => {
        fetchEvaluations();
    }, [courseId]);

    // Obtener evaluaciones
    const fetchEvaluations = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/evaluations/${courseId}`);
            setEvaluations(response.data);
        } catch (error) {
            console.error("Error al obtener evaluaciones:", error);
        }
    };

    // Crear evaluación
    const createEvaluation = async (e) => {
        e.preventDefault();
        try {
            if (!user || !user._id) {
                alert("Error: No se puede identificar el usuario actual");
                return;
            }
            
            const response = await axios.post(`http://localhost:5000/api/evaluations/${courseId}`, {
                title: newEvaluation.title,
                description: newEvaluation.description,
                startDate: newEvaluation.startDate,
                endDate: newEvaluation.endDate,
                createdBy: user._id
            });

            // En lugar de response.data.evaluation, usar directamente response.data
            setEvaluations([...evaluations, response.data]);
            
            setNewEvaluation({
                title: "",
                description: "",
                startDate: "",
                endDate: ""
            });
            setShowCreateForm(false);
            alert("Evaluación creada exitosamente");
        } catch (error) {
            console.error("Error al crear evaluación:", error);
            alert("Error al crear la evaluación");
        }
    };

    // Abrir formulario de edición
    const openEditForm = (evaluation) => {
        setSelectedEvaluation(evaluation);
        setEditEvaluation({
            title: evaluation.title,
            description: evaluation.description || "",
            startDate: formatDateForInput(evaluation.startDate),
            endDate: formatDateForInput(evaluation.endDate)
        });
        setShowEditForm(true);
    };

    // Formatear fecha para input datetime-local
    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    // Actualizar evaluación
    const updateEvaluation = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:5000/api/evaluations/${courseId}/${selectedEvaluation._id}`, {
                title: editEvaluation.title,
                description: editEvaluation.description,
                startDate: editEvaluation.startDate,
                endDate: editEvaluation.endDate
            });

            // Actualizar la lista de evaluaciones
            setEvaluations(evaluations.map(evaluation => 
                evaluation._id === selectedEvaluation._id ? response.data : evaluation
            ));
            
            setShowEditForm(false);
            alert("Evaluación actualizada exitosamente");
        } catch (error) {
            console.error("Error al actualizar evaluación:", error);
            alert("Error al actualizar la evaluación");
        }
    };

    // Eliminar evaluación
    const deleteEvaluation = async (evaluationId) => {
        if (!confirm("¿Estás seguro de eliminar esta evaluación? Esta acción no se puede deshacer.")) {
            return;
        }
        
        try {
            await axios.delete(`http://localhost:5000/api/evaluations/${courseId}/${evaluationId}`);
            setEvaluations(evaluations.filter(evaluation => evaluation._id !== evaluationId));
            alert("Evaluación eliminada exitosamente");
        } catch (error) {
            console.error("Error al eliminar evaluación:", error);
            alert("Error al eliminar la evaluación");
        }
    };

    // Eliminar pregunta específica
    const deleteQuestion = async (evaluationId, questionIndex) => {
        if (!confirm("¿Estás seguro de eliminar esta pregunta? Esta acción no se puede deshacer.")) {
            return;
        }
        
        try {
            const evaluation = evaluations.find(e => e._id === evaluationId);
            if (!evaluation) return;
            
            const updatedQuestions = evaluation.questions.filter((_, index) => index !== questionIndex);
            
            const response = await axios.put(`http://localhost:5000/api/evaluations/${courseId}/${evaluationId}`, {
                questions: updatedQuestions
            });
            
            // Actualizar la lista de evaluaciones
            setEvaluations(evaluations.map(evaluation => 
                evaluation._id === evaluationId ? response.data : evaluation
            ));
            
            alert("Pregunta eliminada exitosamente");
        } catch (error) {
            console.error("Error al eliminar pregunta:", error);
            alert("Error al eliminar la pregunta");
        }
    };

    // Agrega esta función para abrir el formulario de preguntas
    const openQuestionForm = (evaluation) => {
        setSelectedEvaluation(evaluation);
        setShowQuestionForm(true);
    };

    const handleNewEvaluationChange = (e) => {
        const { name, value } = e.target;
        setNewEvaluation({ ...newEvaluation, [name]: value });
    };
    
    const handleEditEvaluationChange = (e) => {
        const { name, value } = e.target;
        setEditEvaluation({ ...editEvaluation, [name]: value });
    };

    // Agregar pregunta a una evaluación existente
    const addQuestion = async (e) => {
        e.preventDefault();
        if (!selectedEvaluation) return;

        try {
            // Obtener la evaluación actual para actualizar sus preguntas
            const currentEvaluation = evaluations.find(e => e._id === selectedEvaluation._id);
            const updatedQuestions = [...(currentEvaluation.questions || []), {
                questionText: newQuestion.questionText,
                options: newQuestion.options,
                correctOption: newQuestion.correctOption
            }];
            
            const response = await axios.put(`http://localhost:5000/api/evaluations/${courseId}/${selectedEvaluation._id}`, {
                questions: updatedQuestions
            });
            
            // Actualizar la lista de evaluaciones
            setEvaluations(evaluations.map(evaluation => 
                evaluation._id === selectedEvaluation._id ? response.data : evaluation
            ));
            
            // Limpiar formulario
            setNewQuestion({
                questionText: "",
                options: ["", "", "", ""],
                correctOption: 0
            });
            setShowQuestionForm(false);
            alert("Pregunta agregada exitosamente");
        } catch (error) {
            console.error("Error al agregar la pregunta:", error);
            alert("Error al agregar la pregunta");
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Evaluaciones</h2>
                <button 
                    className="btn btn-primary" 
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? "Cancelar" : "Crear Evaluación"}
                </button>
            </div>

            {/* Formulario de creación de evaluación */}
            {showCreateForm && (
                <div className="card mb-4">
                    <div className="card-header">Nueva Evaluación</div>
                    <div className="card-body">
                        <form onSubmit={createEvaluation}>
                            <div className="mb-3">
                                <label className="form-label">Título</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="title"
                                    value={newEvaluation.title}
                                    onChange={handleNewEvaluationChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Descripción</label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    value={newEvaluation.description}
                                    onChange={handleNewEvaluationChange}
                                ></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Fecha de inicio</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    name="startDate"
                                    value={newEvaluation.startDate}
                                    onChange={handleNewEvaluationChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Fecha de finalización</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    name="endDate"
                                    value={newEvaluation.endDate}
                                    onChange={handleNewEvaluationChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">
                                Crear Evaluación
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Formulario de edición de evaluación */}
            {showEditForm && selectedEvaluation && (
                <div className="card mb-4">
                    <div className="card-header">
                        <div className="d-flex justify-content-between align-items-center">
                            <span>Editar Evaluación</span>
                            <button 
                                className="btn-close" 
                                onClick={() => setShowEditForm(false)}
                            ></button>
                        </div>
                    </div>
                    <div className="card-body">
                        <form onSubmit={updateEvaluation}>
                            <div className="mb-3">
                                <label className="form-label">Título</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="title"
                                    value={editEvaluation.title}
                                    onChange={handleEditEvaluationChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Descripción</label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    value={editEvaluation.description}
                                    onChange={handleEditEvaluationChange}
                                ></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Fecha de inicio</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    name="startDate"
                                    value={editEvaluation.startDate}
                                    onChange={handleEditEvaluationChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Fecha de finalización</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    name="endDate"
                                    value={editEvaluation.endDate}
                                    onChange={handleEditEvaluationChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">
                                Guardar Cambios
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Formulario para agregar preguntas */}
            {showQuestionForm && selectedEvaluation && (
                <div className="card mb-4">
                    <div className="card-header">
                        <div className="d-flex justify-content-between align-items-center">
                            <span>Agregar Pregunta a: {selectedEvaluation.title}</span>
                            <button 
                                className="btn-close" 
                                onClick={() => setShowQuestionForm(false)}
                            ></button>
                        </div>
                    </div>
                    <div className="card-body">
                        <form onSubmit={(e) => addQuestion(e)}>
                            <div className="mb-3">
                                <label className="form-label">Pregunta</label>
                                <textarea
                                    className="form-control"
                                    name="questionText"
                                    value={newQuestion.questionText}
                                    onChange={(e) => setNewQuestion({...newQuestion, questionText: e.target.value})}
                                    required
                                ></textarea>
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label">Opciones (selecciona la correcta)</label>
                                {newQuestion.options.map((option, index) => (
                                    <div key={index} className="input-group mb-2">
                                        <div className="input-group-text">
                                            <input
                                                type="radio"
                                                name="correctOption"
                                                checked={newQuestion.correctOption === index}
                                                onChange={() => setNewQuestion({...newQuestion, correctOption: index})}
                                                required
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={option}
                                            onChange={(e) => {
                                                const updatedOptions = [...newQuestion.options];
                                                updatedOptions[index] = e.target.value;
                                                setNewQuestion({...newQuestion, options: updatedOptions});
                                            }}
                                            placeholder={`Opción ${index + 1}`}
                                            required
                                        />
                                        {newQuestion.options.length > 2 && (
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-danger"
                                                onClick={() => {
                                                    const updatedOptions = newQuestion.options.filter((_, i) => i !== index);
                                                    const updatedCorrectOption = newQuestion.correctOption >= index && newQuestion.correctOption > 0 
                                                        ? newQuestion.correctOption - 1 
                                                        : newQuestion.correctOption;
                                                    setNewQuestion({
                                                        ...newQuestion, 
                                                        options: updatedOptions,
                                                        correctOption: updatedCorrectOption
                                                    });
                                                }}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {newQuestion.options.length < 6 && (
                                    <button 
                                        type="button" 
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => setNewQuestion({
                                            ...newQuestion,
                                            options: [...newQuestion.options, ""]
                                        })}
                                    >
                                        <i className="bi bi-plus"></i> Agregar opción
                                    </button>
                                )}
                            </div>
                            
                            <button type="submit" className="btn btn-success">
                                Guardar Pregunta
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Lista de evaluaciones */}
            <div className="list-group mt-3">
                {evaluations.length > 0 ? (
                    evaluations.map((evaluation) => (
                        <div key={evaluation._id} className="list-group-item list-group-item-action">
                            <div className="d-flex w-100 justify-content-between align-items-center mb-2">
                                <h5 className="mb-1">{evaluation.title}</h5>
                                <div className="btn-group">
                                    <button 
                                        className="btn btn-sm btn-outline-primary" 
                                        onClick={() => openEditForm(evaluation)}
                                    >
                                        <i className="bi bi-pencil"></i> Editar
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-outline-danger" 
                                        onClick={() => deleteEvaluation(evaluation._id)}
                                    >
                                        <i className="bi bi-trash"></i> Eliminar
                                    </button>
                                </div>
                            </div>
                            <p className="mb-1">{evaluation.description}</p>
                            <small>
                                <strong>Inicio:</strong> {new Date(evaluation.startDate).toLocaleString()} | 
                                <strong> Finalización:</strong> {new Date(evaluation.endDate).toLocaleString()}
                            </small>
                            
                            {/* Preguntas de la evaluación */}
                            <div className="mt-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6>Preguntas ({evaluation.questions?.length || 0})</h6>
                                    <button 
                                        className="btn btn-sm btn-primary" 
                                        onClick={() => openQuestionForm(evaluation)}
                                    >
                                        <i className="bi bi-plus"></i> Agregar Pregunta
                                    </button>
                                </div>
                                
                                {evaluation.questions && evaluation.questions.length > 0 ? (
                                    <div className="list-group mt-2">
                                        {evaluation.questions.map((q, idx) => (
                                            <div key={idx} className="list-group-item">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <strong>{idx + 1}. {q.questionText}</strong>
                                                        <div className="mt-2">
                                                            <small className="text-muted">Opciones:</small>
                                                            <ul className="list-unstyled ms-3">
                                                                {q.options.map((option, optIdx) => (
                                                                    <li key={optIdx}>
                                                                        <small>
                                                                            {optIdx === q.correctOption ? 
                                                                                <span className="text-success">✓ {option}</span> : 
                                                                                option}
                                                                        </small>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => deleteQuestion(evaluation._id, idx)}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted">No hay preguntas agregadas.</p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="alert alert-info">
                        No hay evaluaciones creadas para este curso.
                    </div>
                )}
            </div>
        </div>
    );
}

function StudentsSection({ courseId }) {
    const [students, setStudents] = useState([]);
    const [averageScores, setAverageScores] = useState({});
    const [totalEvaluations, setTotalEvaluations] = useState(0);

    useEffect(() => {
        // Obtener estudiantes y resultados de evaluaciones
        const fetchStudentsAndResults = async () => {
            try {
                // Obtener estudiantes del curso
                const studentsResponse = await axios.get(`http://localhost:5000/courses/${courseId}/students`);
                setStudents(studentsResponse.data);

                // Obtener resultados de evaluaciones
                const resultsResponse = await axios.get(`http://localhost:5000/api/evaluations/${courseId}/results`);
                const { totalEvaluations, studentAverages } = resultsResponse.data;

                // Mapear promedios por estudiante
                const averages = {};
                studentAverages.forEach((entry) => {
                    averages[entry.student._id] = entry.averageScore;
                });

                setAverageScores(averages);
                setTotalEvaluations(totalEvaluations);
            } catch (error) {
                console.error("Error fetching students or evaluation results:", error);
            }
        };

        fetchStudentsAndResults();
    }, [courseId]);

    return (
        <div>
            <h2>Lista de Estudiantes</h2>
            {students.length > 0 ? (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Nombre de Usuario</th>
                            <th>Correo Electrónico</th>
                            <th>Nota Promedio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student._id}>
                                <td>{student.firstName}</td>
                                <td>{student.lastName}</td>
                                <td>{student.username}</td>
                                <td>{student.email}</td>
                                <td>
                                    {totalEvaluations > 0
                                        ? averageScores[student._id] || "N/A"
                                        : "Sin evaluaciones"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-muted">No hay estudiantes matriculados en este curso.</p>
            )}
        </div>
    );
}

export default EditCourse;