import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider"; // Assuming you have an AuthContext

function CourseView() {
    const { id: courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [tabs, setTabs] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [activeEvaluation, setActiveEvaluation] = useState(null);
    const [currentAnswers, setCurrentAnswers] = useState([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [viewingStudents, setViewingStudents] = useState(false);
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
                console.log("Tabs data:", response.data);
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

        fetchCourse();
        fetchTabs();
        fetchEvaluations();
    }, [courseId]);

    const renderDocuments = (documents) => {
        if (!documents || documents.length === 0) {
            return <p className="text-muted">No hay documentos disponibles.</p>;
        }

        return (
            <ul className="list-group mt-2">
                {documents.map((doc) => (
                    <li key={doc._id} className="list-group-item">
                        <p><strong>{doc.name}</strong></p>
                    </li>
                ))}
            </ul>
        );
    };

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

    const startEvaluation = (evaluation) => {
        setActiveEvaluation(evaluation);
        setCurrentAnswers(Array(evaluation.questions.length).fill(null));
    };

    const handleAnswerSelection = (questionIndex, optionIndex) => {
        const newAnswers = [...currentAnswers];
        newAnswers[questionIndex] = optionIndex;
        setCurrentAnswers(newAnswers);
    };

    const submitEvaluation = async () => {
        if (currentAnswers.includes(null)) {
            alert("Por favor responde todas las preguntas antes de enviar");
            return;
        }

        try {
            await axios.post(`http://localhost:5000/api/evaluations/${activeEvaluation._id}/submit`, {
                studentId: user._id,
                answers: currentAnswers
            });
            alert("Evaluación enviada correctamente");
            setActiveEvaluation(null);
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
            fetchEvaluations();
        } catch (error) {
            console.error("Error submitting evaluation:", error);
            alert("Error al enviar la evaluación");
        }
    };

    // Mapeo de estados a etiquetas legibles
    const getStateLabel = (state) => {
        switch (state) {
            case "active":
                return "Activo";
            case "inactive":
                return "Inactivo";
            case "in edition":
                return "En Edición";
            case "published":
                return "Publicado";
            default:
                return "No especificado";
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/enrollment/enroll`, {
                courseID: courseId,
                userID: user._id,
            });

            if (response.status == 200) {
                setIsEnrolled(true);
                updateUser(response.data.user); // Actualiza el usuario en el contexto
            }
            console.log("Enrollment response:", response.data);
        } catch (error) {
            console.error("Error enrolling in course:", error);
        }
    }

    const handleUnenroll = async (courseId) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/enrollment/unenroll`, {
                courseID: courseId,
                userID: user._id,
            });

            if (response.status == 200) {
                setIsEnrolled(false);
                updateUser(response.data.user); // Actualiza el usuario en el contexto
            }
            console.log("Unenrollment response:", response.data);
            // Aquí puedes manejar la respuesta después de la desmatrícula
        } catch (error) {
            console.error("Error unenrolling from course:", error);
        }
    }

    const handleViewStudents = () => {
        setViewingStudents(viewingStudents => !viewingStudents);
    }

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
                                <strong>Estado:</strong> {getStateLabel(course.state)}
                            </p>
                            {course.teacher !== user.username &&
                                (isEnrolled ? (
                                    <button className="btn btn-danger mt-3" onClick={() => handleUnenroll(course._id)}>Desmatricularse</button>
                                ) : (
                                    <button className="btn btn-primary mt-3" onClick={() => handleEnroll(course._id)}>Matricularse</button>
                                ))
                            }
                            <button className="btn btn-info mt-3 ms-3" onClick={handleViewStudents}>
                                {viewingStudents ? "Ver Temas del Curso" : "Ver Lista de Estudiantes"}
                            </button>
                        </div>
                    </div>

                    {viewingStudents ? (
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
                    ) : (

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

                    {evaluations.length > 0 && (
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
                                                onClick={() => startEvaluation(evaluation)}
                                            >
                                                Iniciar Evaluación
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeEvaluation && (
                        <div className="modal d-block" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
                            <div className="modal-dialog modal-lg">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">{activeEvaluation.title}</h5>
                                    </div>
                                    <div className="modal-body">
                                        {activeEvaluation.questions.map((question, qIndex) => (
                                            <div key={qIndex} className="mb-4">
                                                <h6 className="mb-3">{qIndex + 1}. {question.questionText}</h6>
                                                <div className="list-group">
                                                    {question.options.map((option, oIndex) => (
                                                        <button
                                                            key={oIndex}
                                                            type="button"
                                                            className={`list-group-item list-group-item-action ${
                                                                currentAnswers[qIndex] === oIndex ? 'active' : ''
                                                            }`}
                                                            onClick={() => handleAnswerSelection(qIndex, oIndex)}
                                                        >
                                                            {option}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="modal-footer">
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary" 
                                            onClick={() => setActiveEvaluation(null)}
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn btn-primary" 
                                            onClick={submitEvaluation}
                                        >
                                            Enviar Respuestas
                                        </button>
                                    </div>
                                </div>
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
