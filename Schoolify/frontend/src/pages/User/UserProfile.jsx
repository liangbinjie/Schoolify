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
    const [friends, setFriends] = useState([]); // Estado para almacenar los amigos
    const [createdCourses, setCreatedCourses] = useState([]); // Estado para almacenar los cursos creados
    const [enrolledCourses, setEnrolledCourses] = useState([]); // Estado para almacenar los cursos matriculados
    const [showCreatedCourses, setShowCreatedCourses] = useState(false); // Estado para mostrar/ocultar cursos creados
    const [showEnrolledCourses, setShowEnrolledCourses] = useState(false); // Estado para mostrar/ocultar cursos matriculados

    if (!user || !user.username) {
        console.error("El usuario no está autenticado o no tiene un nombre de usuario válido.");
        return;
    }

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/users/${username}`);
            setUserProfile(response.data);
            setProfilePicture(`http://localhost:5000/users/${username}/profile-picture`);
            setCreatedCourses(response.data.createdCourses || []); // Actualiza el estado con los cursos creados
            setEnrolledCourses(response.data.enrolledCourses || []); // Actualiza el estado con los cursos matriculados
        } catch (err) {
            console.error("Error fetching user data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/neo4j/get-friends/${user.username}`);
                setFriends(response.data.friends); // Actualiza el estado con la lista de amigos
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
        fetchFriends();
        fetchUserData();
    }, [username]);

    if (loading) return <p className="text-center m-5">Loading...</p>;
    if (!userProfile) return <h2 className="text-center m-5">Usuario No Encontrado</h2>;

    const sendFriendRequest = async (friendUsername) => {
        try {
            console.log("Sending friend request to:", friendUsername);
            console.log("Current user:", user.username);
    
            const response = await axios.post(`http://localhost:5000/api/friends/send-friend-request/${friendUsername}`, {
                username: user.username, // Asegúrate de que user.username no sea undefined
            });

            if (response.ok) {
                updateUser(response.data.user);
            }

        } catch (error) {
            console.error("Error sending friend request:", error);
            console.error("Error details:", error.response?.data || error.message);
        }
    };

    const handleToggleCreatedCourses = () => {
        setShowCreatedCourses(!showCreatedCourses);
        setShowEnrolledCourses(false); // Ocultar cursos matriculados al mostrar cursos creados
    };

    const handleToggleEnrolledCourses = () => {
        setShowEnrolledCourses(!showEnrolledCourses);
        setShowCreatedCourses(false); // Ocultar cursos creados al mostrar cursos matriculados
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
                    { userProfile.username === user.username || (friends && friends.includes(username)) ? (
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
            <nav style={{ display: "flex", gap: "10px", padding: "10px", backgroundColor: "#e1e1e1", borderRadius: "5px", marginTop: "20px" }}>
                <button
                    className="btn btn-primary flex-fill"
                    style={{ height: "50px", width: "100%" }}
                    onClick={handleToggleEnrolledCourses}
                >
                    Cursos Matriculados
                </button>
                <button
                    className="btn btn-secondary flex-fill"
                    style={{ height: "50px", width: "100%" }}
                    onClick={handleToggleCreatedCourses}
                >
                    Cursos Impartidos
                </button>
            </nav>

            {/* Cursos creados */}
            {showCreatedCourses && (
                <div>
                    <h3>Cursos Creados</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nombre del Curso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {createdCourses.map((course, index) => (
                                <tr key={course.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <a href={`http://localhost:5173/course/${course._id}`} rel="noopener noreferrer">
                                            {course.name}
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Cursos matriculados */}
            {showEnrolledCourses && (
                <div>
                    <h3>Cursos Matriculados</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nombre del Curso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrolledCourses.map((course, index) => (
                                <tr key={course.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <a href={`http://localhost:5173/course/${course._id}`} rel="noopener noreferrer">
                                            {course.name}
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Botones para mostrar/ocultar cursos creados y matriculados */}
        </div>
    );
}

export default UserProfile;