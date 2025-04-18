import React, { useEffect, useState } from "react";
import axios from "axios";

function UserCourses({ userId }) {
    const [createdCourses, setCreatedCourses] = useState([]);

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

    return (
        <div className="container my-5">
            <h1 className="display-4 fw-bold text-center mb-4">Mis Cursos Creados</h1>
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
                                <a href={`/edit-course/${course._id}`} className="btn btn-primary">
                                    Editar
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserCourses;