import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider"; // Importar el contexto de autenticación

function CourseView() {
    const { id: courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [tabs, setTabs] = useState([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [viewingStudents, setViewingStudents] = useState(false);
    const { user, updateUser } = useAuth(); // Obtener el usuario autenticado

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
                                <strong>Profesor:</strong> {course.teacher}
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
                                                    <a href={`http://localhost:5173/user/${student}`} rel="noopener noreferrer">
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
                                                    {tab.contents && renderDocuments(tab.contents)}
                                                    {tab.subtabs && renderSubtabs(tab.subtabs, index)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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