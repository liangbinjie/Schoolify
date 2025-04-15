import React from "react";

function NavbarUserProfile() {
    return (
        <nav style={{ display: "flex", gap: "10px", padding: "10px", backgroundColor: "#e1e1e1", borderRadius: "5px", marginTop: "20px" }}>
            <button
                className="btn btn-primary flex-fill"
                style={{ height: "50px", width: "100%" }}
            >
                Cursos Matriculados
            </button>
            <button
                className="btn btn-secondary flex-fill"
                style={{ height: "50px", width: "100%" }}
            >
                Cursos Impartidos
            </button>
        </nav>
    );
}

export default NavbarUserProfile;