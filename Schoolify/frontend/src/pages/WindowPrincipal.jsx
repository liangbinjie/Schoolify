import React, { useEffect, useState } from "react";
import axios from "axios";

function WindowPrincipal() {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        // Fetch courses from the backend
        const fetchCourses = async () => {
            try {
                const response = await axios.get("http://localhost:5000/courses"); // Adjust the URL if needed
                setCourses(response.data);
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div className="container my-5">
            <h1 className="display-4 fw-bold text-center mb-4">Cursos Disponibles</h1>
            <div className="row">
                {courses.map((course) => (
                    <div className="col-md-4 mb-4" key={course._id}>
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
                                {/* Mostrar el nombre del profesor */}
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

const fetchCourses = async () => {
    try {
        const response = await axios.get("http://localhost:5000/courses");
        console.log("Cursos obtenidos:", response.data); // Verifica los datos aquí
        setCourses(response.data);
    } catch (error) {
        console.error("Error fetching courses:", error);
    }
};
export default WindowPrincipal;