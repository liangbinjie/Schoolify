import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function CourseEvaluation() {
    const { courseId, evaluationId } = useParams(); // Obtener courseId y evaluationId de los parámetros
    const navigate = useNavigate();
    const [evaluation, setEvaluation] = useState(null);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);

    useEffect(() => {
        if (!courseId || !evaluationId) {
            console.error("Course ID or evaluation ID is undefined");
            return;
        }

        const fetchEvaluation = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/evaluations/${courseId}`);
                console.log("Evaluaciones obtenidas:", response.data);

                // Filtrar la evaluación específica por evaluationId
                const selectedEvaluation = response.data.find(evaluation => evaluation._id === evaluationId);

                if (!selectedEvaluation) {
                    console.error("No se encontró la evaluación con el ID proporcionado.");
                    return;
                }

                setEvaluation(selectedEvaluation);
            } catch (error) {
                console.error("Error fetching evaluation:", error);
            }
        };

        fetchEvaluation();
    }, [courseId, evaluationId]);

    const handleOptionChange = (questionIndex, selectedOption) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionIndex]: selectedOption,
        }));
    };

    const handleSubmit = async () => {
        try {
            const formattedAnswers = Object.entries(answers).map(([key, value]) => {
                const questionIndex = parseInt(key, 10);
                const optionIndex = evaluation.questions[questionIndex].options.indexOf(value);
                if (optionIndex === -1) {
                    throw new Error(`Invalid option selected for question ${questionIndex}`);
                }
                return optionIndex;
            });

            const response = await axios.post(`http://localhost:5000/api/evaluations/${evaluation._id}/submit`, {
                studentId: "currentStudentId", // Cambiar por el ID real del estudiante
                answers: formattedAnswers,
            });
            setScore(response.data.score);
        } catch (error) {
            console.error("Error submitting evaluation:", error.response?.data || error.message);
        }
    };

    if (score !== null) {
        return (
            <div className="container my-5">
                <h2>¡Evaluación Finalizada!</h2>
                <p>Tu calificación es: <strong>{score}%</strong></p>
                <button className="btn btn-primary" onClick={() => navigate(-1)}>
                    Volver al Curso
                </button>
            </div>
        );
    }

    return (
        <div className="container my-5">
            {evaluation ? (
                <>
                    <h2 className="mb-4">{evaluation.title}</h2>
                    <p className="mb-4">{evaluation.description}</p>
                    <form>
                        {evaluation.questions && evaluation.questions.length > 0 ? (
                            evaluation.questions.map((question, index) => (
                                <div key={index} className="card mb-4">
                                    <div className="card-header">
                                        <h5 className="mb-0">Pregunta {index + 1}</h5>
                                    </div>
                                    <div className="card-body">
                                        <p className="card-text">{question.questionText}</p>
                                        {question.options.map((option, optionIndex) => (
                                            <div key={optionIndex} className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name={`question-${index}`}
                                                    id={`question-${index}-option-${optionIndex}`}
                                                    value={option}
                                                    onChange={() => handleOptionChange(index, option)}
                                                    checked={answers[index] === option}
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor={`question-${index}-option-${optionIndex}`}
                                                >
                                                    {option}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No hay preguntas disponibles para esta evaluación.</p>
                        )}
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={handleSubmit}
                        >
                            Finalizar Evaluación
                        </button>
                    </form>
                </>
            ) : (
                <p>Cargando evaluación...</p>
            )}
        </div>
    );
}

export default CourseEvaluation;