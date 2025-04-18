import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function EditCourse() {
    const { courseId } = useParams(); // Obtener el ID del curso desde la URL
    const [activeSection, setActiveSection] = useState("general"); // Controlar la sección activa

    // Función para cambiar de sección
    const handleSectionChange = (section) => {
        setActiveSection(section);
    };

    return (
        <div className="container my-5">
            <h1 className="text-center mb-4">Editar Curso</h1>

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
    const [courseData, setCourseData] = useState({
        name: "",
        code: "",
        description: "",
        endDate: "",
        state: "in edition",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourseData({ ...courseData, [name]: value });
    };

    const handleSave = async () => {
        try {
            await axios.put(`http://localhost:5000/courses/${courseId}`, courseData);
            alert("Curso actualizado con éxito");
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
                <button type="button" className="btn btn-primary" onClick={handleSave}>
                    Guardar Cambios
                </button>
            </form>
        </div>
    );
}

function TopicsSection({ courseId }) {
    return (
        <div>
            <h2>Temas y Subtemas</h2>
            <p>Aquí podrás añadir temas, subtemas y archivos al curso.</p>
            {/* Implementación futura */}
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