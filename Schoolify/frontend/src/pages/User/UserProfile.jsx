import React, { useState, useEffect } from "react";
import NavbarUserProfile from "../../components/NavbarUserProfile";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { useAuth } from "../../context/AuthProvider"; // Importa el contexto de autenticación

function UserProfile() {
    const { username } = useParams();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profilePicture, setProfilePicture] = useState(null);
    const { user } = useAuth(); // Obtener el usuario del contexto

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/user/${username}`);
            setUserProfile(response.data);
            setProfilePicture(`http://localhost:5000/user/${username}/profile-picture`);
        } catch (err) {
            console.error("Error fetching user data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [username]);

    if (loading) return <p className="text-center m-5">Loading...</p>;
    if (!userProfile) return <h2 className="text-center m-5">Usuario No Encontrado</h2>;

    const sendFriendRequest = async (friendUsername) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/friends/send-friend-request/${friendUsername}`, {
                username: user.username,
            });
            console.log(response.data);
    
            // Update global context if needed
            updateUser(response.data.user);
    
        } catch (error) {
            console.error("Error sending friend request:", error);
        }
    }

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
                    <p><strong>Usuario: </strong> {username} </p>
                    <p><strong>Nombre:</strong> {userProfile.firstName} {userProfile.lastName}</p>
                    <p><strong>Fecha de Nacimiento:</strong> {userProfile.birthDate}</p>
                    <p><strong>Correo Electrónico:</strong> {userProfile.email}</p>
                    { userProfile.username === user.username || (user.friends && user.friends.includes(username)) ? (
                        <></>
                    ) : (
                        <button className="btn btn-primary" onClick={() => {
                            // Aquí puedes agregar la lógica para enviar la solicitud de amistad
                            alert("Solicitud de amistad enviada a " + username);
                            sendFriendRequest(username);
                        }}>Enviar Solicitud de Amistad</button>
                    )} 

                </div>
            </div>

            {/* Navbar */}
            <NavbarUserProfile />
        </div>
    );
}

export default UserProfile;