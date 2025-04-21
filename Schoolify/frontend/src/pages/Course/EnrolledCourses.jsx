import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider"; // Importar el contexto de autenticación

const EnrolledCourses = () => {
    const { user } = useAuth(); // Obtener el usuario autenticado
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    
    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/enrollment/courses/${user._id}`);
                setEnrolledCourses(response.data);
            } catch (error) {
                console.error("Error fetching enrolled courses:", error);
            }
        };

        fetchEnrolledCourses();
    }
    , [user]);

    return (
        <>
            <div className="m-5">
                <h1>Cursos matriculados</h1>
                <div className="row">
                    {enrolledCourses.map((course) => (
                        <div className="col-md-12" key={course._id}>
                            <div className="card mb-4 d-flex flex-row align-items-center">
                                <img 
                                    src={`http://localhost:5000/courses/${course._id}/image`} 
                                    className="card-img-left" 
                                    alt={course.name} 
                                    style={{height: "100px", objectFit: "cover", marginRight: "15px" }} 
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{course.name}</h5>
                                    <p className="card-text">{course.description}</p>
                                    <a href={`/course/${course._id}`} className="btn btn-primary">Ver curso</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
};

export default EnrolledCourses;

