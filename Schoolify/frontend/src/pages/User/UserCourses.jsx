import React, { useEffect, useState } from "react";
import axios from "axios";

function UserCourses({ userId }) {
    const [createdCourses, setCreatedCourses] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchCreatedCourses = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/users/${userId}/created-courses`);
                setCreatedCourses(response.data);
            } catch (error) {
                console.error("Error fetching created courses:", error);
            }
        };

        fetchCreatedCourses();
    }, [userId]);

    const handlePublishCourse = async (courseId) => {
        try {
            const response = await axios.put(`http://localhost:5000/courses/${courseId}`, {
                state: "published",
            });
            setMessage(`El curso se publicó exitosamente: ${response.data.message}`);
            // Actualizar el estado local para reflejar el cambio
            setCreatedCourses((prevCourses) =>
                prevCourses.map((course) =>
                    course._id === courseId ? { ...course, state: "published" } : course
                )
            );
        } catch (error) {
            console.error("Error publishing course:", error);
            setMessage("Hubo un error al publicar el curso.");
        }
    };

    const handleCloneCourse = async (course) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/courses/clone/${course._id}`, {
                code: `${course.code}-clone`,
                name: `${course.name} (Clone)`,
                description: course.description,
                startDate: course.startDate,
                endDate: course.endDate,
                teacher: course.teacher
            });
            alert('Curso clonado exitosamente!');
            // Optionally, update the list of created courses
            setCreatedCourses([...createdCourses, response.data.course]);
        } catch (error) {
            console.error('Error al clonar el curso:', error);
            alert('Error al clonar el curso. Por favor, inténtelo de nuevo.');
        }
    };

    return (
        <div className="container my-5">
            <h1 className="display-4 fw-bold text-center mb-4">Mis Cursos Creados</h1>
            {message && <div className="alert alert-info">{message}</div>}
            <div className="overflow-y mb-5">

                <div className="row row-cols-1 row-cols-md-3 g-4">
                    {createdCourses.map((course) => (
                        <div className="col" key={course._id}>
                            <div className="card h-100 shadow-sm">
                                <img
                                    src={`http://localhost:5000/courses/${course._id}/image`}
                                    className="card-img-top"
                                    alt={course.name}
                                    style={{ height: "200px", objectFit: "cover" }}
                                    />
                                <div className="card-body">
                                    <h5 className="card-title">{course.name}</h5>
                                    <p className="card-text text-truncate">{course.description}</p>
                                    <p className="text-muted">
                                        <small>Inicio: {new Date(course.startDate).toLocaleDateString()}</small>
                                    </p>
                                    <p className="text-muted">
                                        <small>Profesor: {course.teacher}</small>
                                    </p>
                                    <a href={`/edit-course/${course._id}`} className="btn btn-primary me-2">
                                        Editar
                                    </a>
                                    {course.state !== "published" && (
                                        <button
                                        className="btn btn-success"
                                        onClick={() => handlePublishCourse(course._id)}
                                        >
                                            Publicar
                                        </button>
                                    )}
                                    <button className="btn btn-secondary mt-2" onClick={() => handleCloneCourse(course)}>
                                        Clonar Curso
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UserCourses;