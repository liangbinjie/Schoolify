import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function CourseView() {
    const { id: courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [tabs, setTabs] = useState([]);

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

        fetchCourse();
        fetchTabs();
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
                </>
            ) : (
                <p className="text-center">Cargando información del curso...</p>
            )}
        </div>
    );
}

export default CourseView;