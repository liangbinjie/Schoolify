import React from "react";
import NavbarUserProfile from "../components/NavbarUserProfile";

function UserProfile() {
    const user = {
        firstName: "John",
        lastName: "Doe",
        birthDate: "1990-01-01",
        email: "johndoe@example.com",
        profilePicture: null, // Puedes usar una URL de imagen aquí
    };

    return (
        <div style={{ padding: "20px" }}>
            {/* Perfil de Usuario */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
                {/* Foto de perfil */}
                <div>
                    {user.profilePicture ? (
                        <img
                            src={user.profilePicture}
                            alt="Foto de perfil"
                            style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover" }}
                        />
                    ) : (
                        <div
                            style={{
                                width: "150px",
                                height: "150px",
                                borderRadius: "50%",
                                backgroundColor: "#ddd",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                color: "#555",
                            }}
                        >
                            Sin Foto
                        </div>
                    )}
                </div>

                {/* Información del usuario */}
                <div>
                    <p><strong>Nombre:</strong> {user.firstName} {user.lastName}</p>
                    <p><strong>Fecha de Nacimiento:</strong> {user.birthDate}</p>
                    <p><strong>Correo Electrónico:</strong> {user.email}</p>
                    <button className="btn btn-primary">Enviar Solicitud de Amistad</button>
                </div>
            </div>

            {/* Navbar */}
            <NavbarUserProfile />
        </div>
    );
}

export default UserProfile;