import React, { useEffect, useState } from "react";
import axios from "axios";

function WindowPrincipal() {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        // Fetch courses from the backend
        const fetchCourses = async () => {
            try {
                const response = await axios.get("http://localhost:5000/courses"); // Ajusta la URL si es necesario
                // Filtrar cursos que no estén en estado "Editando" o "Cerrado"
                const filteredCourses = response.data.filter(
                    (course) => course.state !== "in edition" && course.state !== "closed"
                );
                setCourses(filteredCourses);
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div className="container my-5">
            <h1 className="display-4 fw-bold text-center mb-4">Cursos Disponibles</h1>
            {/* Contenedor con overflow-auto */}
            <div className="row overflow-auto flex-nowrap" style={{ whiteSpace: "nowrap" }}>
                {courses.map((course) => (
                    <div className="col-md-4 mb-4 d-inline-block" key={course._id} style={{ float: "none" }}>
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
                                <a href={`/course/${course._id}`} className="btn btn-primary">
                                    Ver Curso
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default WindowPrincipal;