import React, { useState, useEffect } from "react";
import NavbarUserProfile from "../../components/NavbarUserProfile";
import { useParams } from 'react-router-dom';
import axios from "axios";

function UserProfile() {
    const { username } = useParams();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/user/${username}`);
            setUserProfile(response.data);
            setProfilePicture(`http://localhost:5000/user/${username}/profile-picture`);
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("User not found or error fetching data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [username]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!userProfile) return <p>No user data available.</p>;

    return (
        <div style={{ padding: "20px" }}>
            {/* Perfil de Usuario */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
                {/* Foto de perfil */}
                <div>
                    {profilePicture ? (
                        <img
                            src={profilePicture}
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
                    <p><strong>Nombre:</strong> {userProfile.firstName} {userProfile.lastName}</p>
                    <p><strong>Fecha de Nacimiento:</strong> {userProfile.birthDate}</p>
                    <p><strong>Correo Electrónico:</strong> {userProfile.email}</p>
                    <button className="btn btn-primary">Enviar Solicitud de Amistad</button>
                </div>
            </div>

            {/* Navbar */}
            <NavbarUserProfile />
        </div>
    );
}

export default UserProfile;