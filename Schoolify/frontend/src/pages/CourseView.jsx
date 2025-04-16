import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Importa useParams para obtener el parámetro de la URL
import axios from "axios";
import Layout from "../components/Layout";

function CourseView() {
    const { id: courseId } = useParams(); // Obtén el ID del curso desde los parámetros de la URL
    const [course, setCourse] = useState(null);
    const [tabs, setTabs] = useState([]);

    useEffect(() => {
        // Fetch course details
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/courses/${courseId}`);
                console.log("Course data:", response.data); // Verifica los datos del curso
                setCourse(response.data);
            } catch (error) {
                console.error("Error fetching course details:", error);
            }
        };
    
        // Fetch course tabs
        const fetchTabs = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/tabs/courses/${courseId}/tabs`);
                console.log("Tabs data:", response.data); // Verifica los datos de los tabs
                setTabs(response.data);
            } catch (error) {
                console.error("Error fetching course tabs:", error);
            }
        };
    
        fetchCourse();
        fetchTabs();
    }, [courseId]);

    return (
            <div className="container my-5">
                {course ? (
                    <>
                        {/* Nombre del curso, logo y profesor */}
                        <div className="d-flex align-items-center justify-content-center mb-4">
                            {course.image ? (
                                <img
                                    src={`http://localhost:5000/courses/${courseId}/image`}
                                    alt={`${course.name} logo`}
                                    className="img-fluid me-4"
                                    style={{
                                        maxHeight: "200px", // Altura máxima
                                        maxWidth: "200px",  // Ancho máximo
                                        objectFit: "contain", // Mantiene la proporción de la imagen
                                        borderRadius: "10px" // Bordes redondeados
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
                            </div>
                        </div>

                        {/* Contenido del curso */}
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
                                                {tab.contents && tab.contents.length > 0 ? (
                                                    <ul className="list-group">
                                                        {tab.contents.map((content) => (
                                                            <li key={content._id} className="list-group-item">
                                                                {content.title}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p>No hay contenido disponible.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-center">Cargando información del curso...</p>
                )}
            </div>
    );
}

export default CourseView;