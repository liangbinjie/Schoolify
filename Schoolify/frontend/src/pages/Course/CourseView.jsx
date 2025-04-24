import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";

function CourseView() {
    const { id: courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [tabs, setTabs] = useState([]);
    const [filesByTopic, setFilesByTopic] = useState({});
    const [filesBySubtopic, setFilesBySubtopic] = useState({});
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [activeTab, setActiveTab] = useState("temas");
    const [evaluations, setEvaluations] = useState([]);
    const [selectedEvaluation, setSelectedEvaluation] = useState(null);
    const [userAnswers, setUserAnswers] = useState([]);
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [evaluationInProgress, setEvaluationInProgress] = useState(false);
    const [studentResults, setStudentResults] = useState([]);
    const [isLoading, setIsLoading] = useState({});
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Función para calcular tamaño de archivo en formato legible
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Función para determinar el ícono según el tipo de archivo
    const getFileIcon = (contentType) => {
        if (contentType?.includes('image')) return "bi bi-file-image";
        if (contentType?.includes('pdf')) return "bi bi-file-pdf";
        if (contentType?.includes('word') || contentType?.includes('document')) return "bi bi-file-word";
        if (contentType?.includes('excel') || contentType?.includes('spreadsheet')) return "bi bi-file-excel";
        if (contentType?.includes('powerpoint') || contentType?.includes('presentation')) return "bi bi-file-ppt";
        if (contentType?.includes('zip') || contentType?.includes('compressed')) return "bi bi-file-zip";
        if (contentType?.includes('text')) return "bi bi-file-text";
        return "bi bi-file-earmark";
    };

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/courses/${courseId}`);
                setCourse(response.data);
                if (response.data.studentList && response.data.studentList.includes(user.username)) {
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
            if (courseId && user?.username) {
                try {
                    // Cambiamos la ruta para que coincida con la estructura del backend
                    const response = await axios.get(`http://localhost:5000/api/evaluations/${courseId}`);
                    setEvaluations(response.data);
                    
                    // También ajustamos esta ruta
                    if (isEnrolled) {
                        const resultsResponse = await axios.get(
                            `http://localhost:5000/api/evaluations/${courseId}/results/${user._id}`
                        );
                        setStudentResults(resultsResponse.data);
                    }
                } catch (error) {
                    console.error("Error fetching evaluations:", error);
                }
            }
        };

        fetchCourse();
        fetchTabs();
        if (isEnrolled) {
            fetchEvaluations();
        }
    }, [courseId, user?.username, isEnrolled, user?._id]);

    const fetchFilesByTopic = async (topicId) => {
        try {
            console.log(`Fetching files for topic: ${topicId} in course: ${courseId}`);
            setIsLoading(prev => ({ ...prev, [`topic_${topicId}`]: true }));
            
            const response = await axios.get(
                `http://localhost:5000/api/cassandra-files/list/topic/${courseId}/${topicId}`
            );
            
            console.log("Files received for topic:", response.data);
            setFilesByTopic(prev => ({
                ...prev,
                [topicId]: response.data
            }));
        } catch (error) {
            console.error(`Error fetching files for topic ${topicId}:`, error);
            setFilesByTopic(prev => ({
                ...prev,
                [topicId]: []
            }));
        } finally {
            setIsLoading(prev => ({ ...prev, [`topic_${topicId}`]: false }));
        }
    };

    const fetchFilesBySubtopic = async (topicId, subtopicId) => {
        try {
            console.log(`Fetching files for subtopic: ${subtopicId} in topic: ${topicId} of course: ${courseId}`);
            setIsLoading(prev => ({ ...prev, [`subtopic_${subtopicId}`]: true }));
            
            const response = await axios.get(
                `http://localhost:5000/api/cassandra-files/list/subtopic/${courseId}/${topicId}/${subtopicId}`
            );
            
            console.log("Files received for subtopic:", response.data);
            setFilesBySubtopic(prev => ({
                ...prev,
                [subtopicId]: response.data
            }));
        } catch (error) {
            console.error(`Error fetching files for subtopic ${subtopicId}:`, error);
            setFilesBySubtopic(prev => ({
                ...prev,
                [subtopicId]: []
            }));
        } finally {
            setIsLoading(prev => ({ ...prev, [`subtopic_${subtopicId}`]: false }));
        }
    };

    const downloadFile = async (fileId, fileName) => {
        try {
            console.log(`Downloading file: ${fileId}`);
            
            // Crear un enlace de descarga
            const link = document.createElement('a');
            link.href = `http://localhost:5000/api/cassandra-files/download/${fileId}`;
            link.download = fileName || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading file:", error);
            alert("Error al descargar el archivo. Por favor, inténtelo de nuevo.");
        }
    };

    const renderFiles = (files, itemId, type) => {
        // Si está cargando, mostrar indicador
        if (isLoading[`${type}_${itemId}`]) {
            return (
                <div className="text-center my-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <span className="ms-2">Cargando archivos...</span>
                </div>
            );
        }
        
        // Si no hay archivos, mostrar mensaje
        if (!files || files.length === 0) {
            return (
                <div className="alert alert-light text-center py-2">
                    <i className="bi bi-info-circle me-2"></i>
                    No hay archivos disponibles en esta sección.
                </div>
            );
        }
        
        // Renderizar la lista de archivos
        return (
            <div className="list-group mt-2">
                {files.map((file) => (
                    <div 
                        key={file.file_id} 
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    >
                        <div>
                            <i className={`${getFileIcon(file.content_type)} me-2 text-primary`}></i>
                            <span>{file.filename}</span>
                            {file.size && (
                                <small className="text-muted ms-2">({formatFileSize(file.size)})</small>
                            )}
                        </div>
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => downloadFile(file.file_id, file.filename)}
                        >
                            <i className="bi bi-download me-1"></i> Descargar
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    const renderSubtabs = (subtabs, topicId) => (
        <div className="accordion mt-2" id={`subtabs-${topicId}`}>
            {subtabs.map((subtab) => (
                <div className="accordion-item" key={subtab._id}>
                    <h2 className="accordion-header" id={`subtab-heading-${subtab._id}`}>
                        <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#subtab-collapse-${subtab._id}`}
                            aria-expanded="false"
                            aria-controls={`subtab-collapse-${subtab._id}`}
                            onClick={() => fetchFilesBySubtopic(topicId, subtab._id)}
                        >
                            {subtab.title}
                        </button>
                    </h2>
                    <div
                        id={`subtab-collapse-${subtab._id}`}
                        className="accordion-collapse collapse"
                        aria-labelledby={`subtab-heading-${subtab._id}`}
                        data-bs-parent={`#subtabs-${topicId}`}
                    >
                        <div className="accordion-body">
                            <p>{subtab.description}</p>
                            {isEnrolled && (
                                <div className="mt-3">
                                    <h6 className="border-bottom pb-2">
                                        <i className="bi bi-folder2-open me-2"></i>
                                        Archivos del subtema
                                    </h6>
                                    {renderFiles(filesBySubtopic[subtab._id], subtab._id, 'subtopic')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const startEvaluation = (evaluation) => {
        setSelectedEvaluation(evaluation);
        setUserAnswers(new Array(evaluation.questions.length).fill(null));
        setEvaluationInProgress(true);
        setEvaluationResult(null);
    };

    const handleAnswerChange = (questionIndex, optionIndex) => {
        const newAnswers = [...userAnswers];
        newAnswers[questionIndex] = optionIndex;
        setUserAnswers(newAnswers);
    };

    const submitEvaluation = async () => {
        try {
            // Verificar que todas las preguntas estén respondidas
            if (userAnswers.includes(null)) {
                alert("Por favor responde todas las preguntas antes de enviar.");
                return;
            }

            // Actualizar la ruta aquí también
            const response = await axios.post(
                `http://localhost:5000/api/evaluations/${selectedEvaluation._id}/submit`,
                {
                    studentId: user._id,
                    answers: userAnswers
                }
            );

            setEvaluationResult(response.data);
            setEvaluationInProgress(false);
            
            // Actualizar la ruta aquí también
            const resultsResponse = await axios.get(
                `http://localhost:5000/api/evaluations/${courseId}/results/${user._id}`
            );
            setStudentResults(resultsResponse.data);
        } catch (error) {
            console.error("Error submitting evaluation:", error);
            if (error.response && error.response.data && error.response.data.message) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert("Error al enviar la evaluación. Intenta de nuevo más tarde.");
            }
        }
    };

    const resetEvaluation = () => {
        setSelectedEvaluation(null);
        setUserAnswers([]);
        setEvaluationResult(null);
        setEvaluationInProgress(false);
    };

    // Componente para mostrar la lista de evaluaciones
    const EvaluationsList = () => (
        <div className="mt-4">
            <h4 className="mb-3">Evaluaciones disponibles</h4>
            {evaluations.length > 0 ? (
                <div className="list-group">
                    {evaluations.map((evaluation) => {
                        // Verificar si el estudiante ya realizó esta evaluación
                        const hasCompleted = studentResults.some(
                            r => r.evaluation && r.evaluation._id === evaluation._id
                        );
                        
                        // Encontrar el resultado si existe
                        const result = studentResults.find(
                            r => r.evaluation && r.evaluation._id === evaluation._id
                        );
                        
                        return (
                            <div key={evaluation._id} className="list-group-item list-group-item-action">
                                <div className="d-flex w-100 justify-content-between align-items-center">
                                    <div>
                                        <h5 className="mb-1">{evaluation.title}</h5>
                                        <p className="mb-1">{evaluation.description}</p>
                                        <small>
                                            Fecha de inicio: {new Date(evaluation.startDate).toLocaleDateString()} | 
                                            Fecha de cierre: {new Date(evaluation.endDate).toLocaleDateString()}
                                        </small>
                                        {hasCompleted && (
                                            <div className="mt-1">
                                                <span className="badge bg-success me-2">Completada</span>
                                                <span className="badge bg-primary">Puntaje: {result.score.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        {!hasCompleted ? (
                                            <button 
                                                className="btn btn-primary"
                                                onClick={() => startEvaluation(evaluation)}
                                            >
                                                Realizar evaluación
                                            </button>
                                        ) : (
                                            <button 
                                                className="btn btn-outline-secondary"
                                                disabled
                                            >
                                                Ya completada
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="alert alert-info">
                    No hay evaluaciones disponibles en este curso.
                </div>
            )}
        </div>
    );

    // Componente para tomar la evaluación
    const TakeEvaluation = () => (
        <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>{selectedEvaluation.title}</h4>
                <button 
                    className="btn btn-outline-secondary"
                    onClick={resetEvaluation}
                >
                    Volver a la lista
                </button>
            </div>
            
            <p className="mb-4">{selectedEvaluation.description}</p>
            
            <form>
                {selectedEvaluation.questions.map((question, qIndex) => (
                    <div key={qIndex} className="card mb-4">
                        <div className="card-header bg-light">
                            <strong>Pregunta {qIndex + 1}:</strong> {question.questionText}
                        </div>
                        <div className="card-body">
                            <div className="list-group">
                                {question.options.map((option, oIndex) => (
                                    <label key={oIndex} className="list-group-item">
                                        <input
                                            type="radio"
                                            name={`question-${qIndex}`}
                                            value={oIndex}
                                            checked={userAnswers[qIndex] === oIndex}
                                            onChange={() => handleAnswerChange(qIndex, oIndex)}
                                            className="me-2"
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={submitEvaluation}
                    >
                        Enviar evaluación
                    </button>
                </div>
            </form>
        </div>
    );

    // Componente para mostrar el resultado
    const EvaluationResults = () => (
        <div className="mt-4">
            <div className="alert alert-success text-center">
                <h4 className="alert-heading">¡Evaluación completada!</h4>
                <p className="display-4 my-4">{evaluationResult.score.toFixed(1)} puntos</p>
                <hr />
                <p className="mb-0">Has completado con éxito la evaluación "{selectedEvaluation.title}".</p>
            </div>
            
            <div className="d-flex justify-content-center mt-4">
                <button 
                    className="btn btn-primary"
                    onClick={resetEvaluation}
                >
                    Volver a la lista de evaluaciones
                </button>
            </div>
        </div>
    );

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
                            <div className="bg-light rounded p-4 me-4 text-center" style={{width: "200px", height: "150px"}}>
                                <i className="bi bi-image text-muted" style={{fontSize: "2rem"}}></i>
                                <p className="mt-2 text-muted">Sin imagen</p>
                            </div>
                        )}
                        <div>
                            <h1 className="display-4 fw-bold">{course.name}</h1>
                            <p className="text-muted fs-3">
                                <strong>Profesor:</strong>{" "}
                                <a href={`http://localhost:5173/users/${course.teacher}`}>{course.teacher}</a>
                            </p>
                            <p className="text-muted fs-4">
                                <strong>Estado:</strong>{" "}
                                <span className={`badge ${course.state === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                    {course.state === 'active' ? 'Activo' : 
                                     course.state === 'published' ? 'Publicado' : 
                                     course.state === 'closed' ? 'Cerrado' : 'En edición'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === "temas" ? "active" : ""}`}
                                onClick={() => setActiveTab("temas")}
                            >
                                <i className="bi bi-book me-1"></i> Temas del Curso
                            </button>
                        </li>
                        {isEnrolled && (
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === "evaluaciones" ? "active" : ""}`}
                                    onClick={() => setActiveTab("evaluaciones")}
                                >
                                    <i className="bi bi-clipboard-check me-1"></i> Evaluaciones
                                </button>
                            </li>
                        )}
                    </ul>

                    {activeTab === "temas" && (
                        <div className="card mt-4">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <i className="bi bi-list-check me-2"></i> 
                                    Contenido del curso
                                </h5>
                                {tabs.length > 0 ? (
                                    <div className="accordion" id="courseTabsAccordion">
                                        {tabs.map((tab, index) => (
                                            <div className="accordion-item" key={tab._id}>
                                                <h2 className="accordion-header" id={`heading-${index}`}>
                                                    <button
                                                        className="accordion-button collapsed"
                                                        type="button"
                                                        data-bs-toggle="collapse"
                                                        data-bs-target={`#collapse-${index}`}
                                                        aria-expanded="false"
                                                        aria-controls={`collapse-${index}`}
                                                        onClick={() => fetchFilesByTopic(tab._id)}
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
                                                        <p>{tab.description}</p>
                                                        

                                                        {isEnrolled && (
                                                            <div className="mt-3">
                                                                <h6 className="border-bottom pb-2">
                                                                    <i className="bi bi-folder2-open me-2"></i>
                                                                    Archivos del tema
                                                                </h6>
                                                                {renderFiles(filesByTopic[tab._id], tab._id, 'topic')}
                                                            </div>
                                                        )}
                                                        
                                                        {tab.subtabs && tab.subtabs.length > 0 && (
                                                            <div className="mt-4">
                                                                <h6 className="border-bottom pb-2">
                                                                    <i className="bi bi-diagram-3 me-2"></i>
                                                                    Subtemas
                                                                </h6>
                                                                {renderSubtabs(tab.subtabs, tab._id)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="alert alert-info text-center my-4">
                                        <i className="bi bi-info-circle-fill me-2"></i>
                                        Este curso aún no tiene temas disponibles
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "evaluaciones" && isEnrolled && (
                        <div className="card mt-4">
                            <div className="card-body">
                                {!selectedEvaluation && <EvaluationsList />}
                                {selectedEvaluation && evaluationInProgress && <TakeEvaluation />}
                                {selectedEvaluation && !evaluationInProgress && evaluationResult && <EvaluationResults />}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando información del curso...</p>
                </div>
            )}
        </div>
    );
}

export default CourseView;
