import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
                                                <span>{subtab.title}</span>
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
    return (
        <div>
            <h2>Evaluaciones</h2>
            <p>Aquí podrás crear evaluaciones para el curso.</p>
            {/* Implementación futura */}
        </div>
    );
}

function StudentsSection({ courseId }) {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/courses/${courseId}/students`);
                setStudents(response.data);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };

        fetchStudents();
    }, [courseId]);

    return (
        <div>
            <h2>Lista de Estudiantes</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Nombre de Usuario</th>
                        <th>Correo Electrónico</th>
                        <th>Notas</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr key={student._id}>
                            <td>{student.firstName}</td>
                            <td>{student.lastName}</td>
                            <td>{student.username}</td>
                            <td>{student.email}</td>
                            <td>{student.grade || "N/A"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default EditCourse;