import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider"; // Assuming you have an AuthContext

function CourseView() {
    const { id: courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [tabs, setTabs] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [evaluationResults, setEvaluationResults] = useState([]);
    const [activeEvaluation, setActiveEvaluation] = useState(null);
    const [currentAnswers, setCurrentAnswers] = useState([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [activeTab, setActiveTab] = useState("temas");
    const [showEnrollPopup, setShowEnrollPopup] = useState(false); // Nuevo estado
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/courses/${courseId}`);
                setCourse(response.data);
                if (response.data.studentList.includes(user.username)) {
                    setIsEnrolled(true);
                }
            } catch (error) {
                console.error("Error fetching course details:", error);
            }
        };

        const fetchTabs = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/tabs/courses/${courseId}/tabs`);
                setTabs(response.data);
            } catch (error) {
                console.error("Error fetching course tabs:", error);
            }
        };

        const fetchEvaluations = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/evaluations/${courseId}`);
                const now = new Date();
                const activeEvals = response.data.filter(
                    evaluation => new Date(evaluation.startDate) <= now && new Date(evaluation.endDate) >= now
                );
                setEvaluations(activeEvals);
            } catch (error) {
                console.error("Error fetching evaluations:", error);
            }
        };

        const fetchEvaluationResults = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/evaluations/${courseId}/results/${user._id}`);
                setEvaluationResults(response.data);
            } catch (error) {
                console.error("Error fetching evaluation results:", error);
            }
        };

        fetchCourse();
        fetchTabs();
        fetchEvaluations();
        if (isEnrolled) {
            fetchEvaluationResults();
        }
    }, [courseId, isEnrolled, user._id]);

    const renderSubtabs = (subtabs) => (
        <ul className="list-group mt-2">
            {subtabs.map((subtab) => (
                <li key={subtab._id} className="list-group-item">
                    <p><strong>{subtab.title}</strong></p>
                    {subtab.contents && subtab.contents.length > 0 && (
                        <ul className="list-group mt-2">
                            {subtab.contents.map((doc) => (
                                <li key={doc._id} className="list-group-item">
                                    <p>{doc.name}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                    {subtab.subtabs && renderSubtabs(subtab.subtabs)}
                </li>
            ))}
        </ul>
    );

    const handleEnroll = async (courseId) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/enrollment/enroll`, {
                courseID: courseId,
                userID: user._id,
            });

            if (response.status === 200) {
                setIsEnrolled(true);
                setShowEnrollPopup(true); // Mostrar el pop-up
            }
        } catch (error) {
            console.error("Error enrolling in course:", error);
        }
    };

    const handleUnenroll = async (courseId) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/enrollment/unenroll`, {
                courseID: courseId,
                userID: user._id,
            });

            if (response.status === 200) {
                setIsEnrolled(false);
            }
        } catch (error) {
            console.error("Error unenrolling from course:", error);
        }
    };

    return (
        <div className="container my-5">
            {course ? (
                <>
                    <div className="d-flex align-items-center justify-content-center mb-4">
                        {course.image ? (
                            <img
                                src={`http://localhost:5000/courses/${courseId}/image`}
                                alt={`${course.name} logo`}
                                className="img-fluid me-4"
                                style={{
                                    maxHeight: "200px",
                                    maxWidth: "200px",
                                    objectFit: "contain",
                                    borderRadius: "10px",
                                }}
                            />
                        ) : (
                            <p>No hay logo disponible.</p>
                        )}
                        <div>
                            <h1 className="display-4 fw-bold">{course.name}</h1>
                            <p className="text-muted fs-3">
                                <strong>Profesor:</strong> <a href={`http://localhost:5173/users/${course.teacher}`}>{course.teacher}</a>
                            </p>
                            <p className="text-muted fs-4">
                                <strong>Estado:</strong> {course.state}
                            </p>
                            {course.teacher !== user.username &&
                                (isEnrolled ? (
                                    <button className="btn btn-danger mt-3" onClick={() => handleUnenroll(course._id)}>Desmatricularse</button>
                                ) : (
                                    <button className="btn btn-primary mt-3" onClick={() => handleEnroll(course._id)}>Matricularse</button>
                                ))
                            }
                        </div>
                    </div>

                    {/* Navbar */}
                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === "temas" ? "active" : ""}`}
                                onClick={() => setActiveTab("temas")}
                            >
                                Temas del Curso
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === "estudiantes" ? "active" : ""}`}
                                onClick={() => setActiveTab("estudiantes")}
                            >
                                Lista de Estudiantes
                            </button>
                        </li>
                        {isEnrolled && (
                            <>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === "evaluaciones" ? "active" : ""}`}
                                        onClick={() => setActiveTab("evaluaciones")}
                                    >
                                        Evaluaciones
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === "resultados" ? "active" : ""}`}
                                        onClick={() => setActiveTab("resultados")}
                                    >
                                        Resultados
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>

                    {/* Modal de felicitación */}
                    {showEnrollPopup && (
                        <div className="modal show d-block" tabIndex="-1" role="dialog">
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">¡Felicidades!</h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setShowEnrollPopup(false)}
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        <p>Te has matriculado exitosamente en el curso <strong>{course.name}</strong>.</p>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => setShowEnrollPopup(false)}
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contenido del navbar */}
                    {activeTab === "temas" && (
                        <div className="card mt-4">
                            <div className="card-body">
                                <h5 className="card-title">Temas del Curso</h5>
                                <div className="accordion" id="courseTabsAccordion">
                                    {tabs.map((tab, index) => (
                                        <div className="accordion-item" key={tab._id}>
                                            <h2 className="accordion-header" id={`heading-${index}`}>
                                                <button
                                                    className="accordion-button"
                                                    type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target={`#collapse-${index}`}
                                                    aria-expanded="false"
                                                    aria-controls={`collapse-${index}`}
                                                >
                                                    {tab.title}
                                                </button>
                                            </h2>
                                            <div
                                                id={`collapse-${index}`}
                                                className="accordion-collapse collapse"
                                                aria-labelledby={`heading-${index}`}
                                                data-bs-parent="#courseTabsAccordion"
                                            >
                                                <div className="accordion-body">
                                                    {tab.subtabs && renderSubtabs(tab.subtabs)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "estudiantes" && (
                        <div className="card mt-4">
                            <div className="card-body">
                                <h5 className="card-title">Lista de Estudiantes</h5>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Nombre de Usuario</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {course.studentList.map((student, index) => (
                                            <tr key={student}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <a href={`http://localhost:5173/users/${student}`} rel="noopener noreferrer">
                                                        {student}
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {isEnrolled && activeTab === "evaluaciones" && (
                        <div className="card mt-4">
                            <div className="card-body">
                                <h5 className="card-title">Evaluaciones Disponibles</h5>
                                <div className="list-group">
                                    {evaluations.map(evaluation => (
                                        <div key={evaluation._id} className="list-group-item list-group-item-action">
                                            <div className="d-flex w-100 justify-content-between">
                                                <h5 className="mb-1">{evaluation.title}</h5>
                                                <small>Disponible hasta: {new Date(evaluation.endDate).toLocaleString()}</small>
                                            </div>
                                            <p className="mb-1">{evaluation.description}</p>
                                            <small>Preguntas: {evaluation.questions.length}</small>
                                            <button 
                                                className="btn btn-primary btn-sm mt-2"
                                                onClick={() => setActiveEvaluation(evaluation)}
                                            >
                                                Iniciar Evaluación
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {isEnrolled && activeTab === "resultados" && (
                        <div className="card mt-4">
                            <div className="card-body">
                                <h5 className="card-title">Resultados de Evaluaciones</h5>
                                {evaluationResults.length > 0 ? (
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Título</th>
                                                <th>Calificación</th>
                                                <th>Fecha de Envío</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {evaluationResults.map(result => (
                                                <tr key={result._id}>
                                                    <td>{result.evaluation.title}</td>
                                                    <td>{result.score}%</td>
                                                    <td>{new Date(result.submittedAt).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-muted">No hay resultados disponibles.</p>
                                )}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-center">Cargando información del curso...</p>
            )}
        </div>
    );
}

export default CourseView;
