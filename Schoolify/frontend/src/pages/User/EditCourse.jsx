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
            <h1 className="text-center mb-4">Editando Curso {courseName}</h1>

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

    // Obtener los datos del curso al montar el componente
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/courses/${courseId}`);
                setCourseData({
                    name: response.data.name,
                    code: response.data.code,
                    description: response.data.description,
                    startDate: response.data.startDate.split("T")[0], // Formato de fecha
                    endDate: response.data.endDate.split("T")[0], // Formato de fecha
                    state: response.data.state,
                    image: null, // Imagen no se carga aquí
                });
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
        setCourseData({ ...courseData, image: e.target.files[0] });
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
                formData.append("image", courseData.image); // Asegúrate de que la imagen se incluya
            }

            await axios.put(`http://localhost:5000/courses/${courseId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("Curso actualizado con éxito");
            navigate("/cursos-creados");
        } catch (error) {
            console.error("Error al actualizar el curso:", error);
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
                    <input
                        type="file"
                        className="form-control"
                        name="image"
                        onChange={handleImageChange}
                    />
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
    const [newSubtopic, setNewSubtopic] = useState({ title: "", description: "", order: 1, contents: [] });
    const [expandedTopicId, setExpandedTopicId] = useState(null);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/tabs/courses/${courseId}/tabs`);
                setTopics(response.data);
            } catch (error) {
                console.error("Error al obtener los temas:", error);
            }
        };

        fetchTopics();
    }, [courseId]);

    // Manejar cambios en el formulario de nuevo tema
    const handleTopicInputChange = (e) => {
        const { name, value } = e.target;
        setNewTopic({ ...newTopic, [name]: value });
    };

    const handleTopicFileChange = (e) => {
        const files = Array.from(e.target.files);
        setNewTopic({ ...newTopic, contents: [...newTopic.contents, ...files] });
    };

    // Guardar un nuevo tema
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

            setTopics([...topics, response.data]);
            setNewTopic({ title: "", description: "", order: 1, contents: [] });
        } catch (error) {
            console.error("Error al guardar el tema:", error);
        }
    };

    // Manejar cambios en el formulario de subtema
    const handleSubtopicInputChange = (e) => {
        const { name, value } = e.target;
        setNewSubtopic({ ...newSubtopic, [name]: value });
    };

    const handleSubtopicFileChange = (e) => {
        const files = Array.from(e.target.files);
        setNewSubtopic({ ...newSubtopic, contents: [...newSubtopic.contents, ...files] });
    };

    // Guardar un nuevo subtema
    const saveSubtopic = async (topicId) => {
        try {
            const formData = new FormData();
            formData.append("title", newSubtopic.title);
            formData.append("description", newSubtopic.description);
            formData.append("order", newSubtopic.order);
            newSubtopic.contents.forEach((file) => formData.append("contents", file));

            const response = await axios.post(
                `http://localhost:5000/api/tabs/courses/${courseId}/tabs/${topicId}/subtabs`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            setTopics(
                topics.map((topic) =>
                    topic._id === topicId
                        ? { ...topic, subtabs: [...(topic.subtabs || []), response.data.subtab] }
                        : topic
                )
            );

            setNewSubtopic({ title: "", description: "", order: 1, contents: [] });
        } catch (error) {
            console.error("Error al guardar el subtema:", error);
        }
    };

    const toggleTopic = (topicId) => {
        setExpandedTopicId(expandedTopicId === topicId ? null : topicId);
    };

    return (
        <div>
            <h2>Temas</h2>

            {/* Formulario para añadir un nuevo tema */}
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
                    <div className="mb-3">
                        <label className="form-label">Contenido (Archivos)</label>
                        <input
                            type="file"
                            className="form-control"
                            multiple
                            onChange={handleTopicFileChange}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={saveTopic}>
                        Guardar Tema
                    </button>
                </div>
            </div>

            {/* Lista de temas */}
            {topics.length > 0 ? (
                topics.map((topic) => (
                    <div key={topic._id} className="card mb-3">
                        <div className="card-header d-flex justify-content-between">
                            <span>{topic.title}</span>
                            <button
                                className="btn btn-link"
                                onClick={() => toggleTopic(topic._id)}
                            >
                                {expandedTopicId === topic._id ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>
                        {expandedTopicId === topic._id && (
                            <div className="card-body">
                                <p>{topic.description}</p>
                                <h5>Subtemas</h5>
                                <ul>
                                    {(topic.subtabs || []).map((subtab) => (
                                        <li key={subtab._id}>{subtab.title}</li>
                                    ))}
                                </ul>
                                <h6>Agregar Subtema</h6>
                                <div className="mb-3">
                                    <label className="form-label">Título</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="title"
                                        value={newSubtopic.title}
                                        onChange={handleSubtopicInputChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Descripción</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        value={newSubtopic.description}
                                        onChange={handleSubtopicInputChange}
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Orden</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="order"
                                        value={newSubtopic.order}
                                        onChange={handleSubtopicInputChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Contenido (Archivos)</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        multiple
                                        onChange={handleSubtopicFileChange}
                                    />
                                </div>
                                <button
                                    className="btn btn-success"
                                    onClick={() => saveSubtopic(topic._id)}
                                >
                                    Guardar Subtema
                                </button>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p>No hay temas disponibles.</p>
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