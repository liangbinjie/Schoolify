import React, {useEffect} from 'react';
import { useAuth } from '../../context/AuthProvider'; // Importa el contexto de autenticación
import axios from 'axios';

function Friends() {
    const { user, updateUser } = useAuth(); // Obtener el usuario del contexto
    const friends = user.friends || []; // Obtener la lista de amigos del usuario

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:5000/user/${user.username}`);
                const userData = await response.json();
                updateUser(userData); // Actualizar el usuario en el contexto
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
        fetchUser();
    }, []);

    const handleUnfriend = async (friendUsername) => {
        try {
            const res = await axios.post(`http://localhost:5000/api/friends/unfriend/${friendUsername}`, {
                username: user.username 
            })

            console.log("USER",user);
            
            console.log(res);
            if (res.status === 200) {
                console.log('Unfollowed friend successfully');
                updateUser(res.data.user); // Actualizar el usuario en el contexto
            } else {
                console.error('Error unfollowing friend:', res.statusText);
            }
        } catch (error) {
            console.error('Error unfollowing friend:', error);
        }
    }

    return (
        <div className="container mt-4">
            <h2 className="text-secondary display-5">Mis Amigos</h2>
            <p className="text-muted lead">Aquí puedes manejar a tus amigos.</p>
            <hr />
            <div className="row">
                {friends.map((friend, index) => (
                    <div key={index} className="col-md-4 mb-4">
                        <div className="card shadow-sm">
                            <div className="card-body text-center">
                                <h5 className="card-title font-weight-bold">{friend}</h5>
                                <a 
                                    href={`http://localhost:5173/user/${friend}`} 
                                    className="btn btn-primary mt-2 p-2 me-2"
                                >
                                    Ver Perfil
                                </a>
                                <button 
                                    onClick={() => {handleUnfriend(friend)} }
                                    className="btn btn-danger mt-2 p-2"
                                >
                                    Unfollow
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Friends;