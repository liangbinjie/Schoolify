import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider"; // Assuming you have an AuthContext

function CourseView() {
    const { id: courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [tabs, setTabs] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [activeEvaluation, setActiveEvaluation] = useState(null);
    const [currentAnswers, setCurrentAnswers] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/courses/${courseId}`);
                setCourse(response.data);
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

    const renderSubtabs = (subtabs, parentIndex) => (
        <div className="accordion mt-2" id={`subtabsAccordion-${parentIndex}`}>
            {subtabs.map((subtab, subIndex) => (
                <div className="accordion-item" key={subtab._id}>
                    <h2 className="accordion-header" id={`subtab-heading-${parentIndex}-${subIndex}`}>
                        <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#subtab-collapse-${parentIndex}-${subIndex}`}
                            aria-expanded="false"
                            aria-controls={`subtab-collapse-${parentIndex}-${subIndex}`}
                        >
                            {subtab.title}
                        </button>
                    </h2>
                    <div
                        id={`subtab-collapse-${parentIndex}-${subIndex}`}
                        className="accordion-collapse collapse"
                        aria-labelledby={`subtab-heading-${parentIndex}-${subIndex}`}
                        data-bs-parent={`#subtabsAccordion-${parentIndex}`}
                    >
                        <div className="accordion-body">
                            {subtab.contents && renderDocuments(subtab.contents)}
                            {subtab.subtabs && renderSubtabs(subtab.subtabs, `${parentIndex}-${subIndex}`)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
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
                                <strong>Profesor:</strong> {course.teacher}
                            </p>
                            <button className="btn btn-primary mt-3">Matricularse</button>
                        </div>
                    </div>

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
                                                {tab.contents && renderDocuments(tab.contents)}
                                                {tab.subtabs && renderSubtabs(tab.subtabs, index)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

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
