import React from "react";
import { useNavigate } from "react-router-dom";

function NavbarUserProfile() {
    const navigate = useNavigate();

    const handleEnrolledCourses = () => {
        navigate("/cursos-matriculados");
    };

    const handleCreatedCourses = () => {
        navigate("/cursos-creados");
    };

    return (
        <nav style={{ display: "flex", gap: "10px", padding: "10px", backgroundColor: "#e1e1e1", borderRadius: "5px", marginTop: "20px" }}>
            <button
                className="btn btn-primary flex-fill"
                style={{ height: "50px", width: "100%" }}
                onClick={handleEnrolledCourses}
            >
                Cursos Matriculados
            </button>
            <button
                className="btn btn-secondary flex-fill"
                style={{ height: "50px", width: "100%" }}
                onClick={handleCreatedCourses}
            >
                Cursos Impartidos
            </button>
        </nav>
    );
}

export default NavbarUserProfile;