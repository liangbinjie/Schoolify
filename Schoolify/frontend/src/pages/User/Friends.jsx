import React, {useEffect, useState} from 'react';
import { useAuth } from '../../context/AuthProvider'; // Importa el contexto de autenticación
import axios from 'axios';

function Friends() {
    const { user, updateUser } = useAuth(); // Obtener el usuario del contexto
    const [friends, setFriends] = useState([]); // Estado para almacenar los amigos

    const fetchFriends = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/neo4j/get-friends/${user.username}`, {
            });
            if (response.data.friends.length != 0) {
                setFriends(response.data.friends); // Update the state with the list of friends
            } 
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };


    useEffect(() => {
        fetchFriends();
    }, []);

    const handleUnfriend = async (friendUsername) => {
        try {
            const res = await axios.post(`http://localhost:5000/api/neo4j/unfriend`, {
                myUsername: user.username ,
                friendUsername: friendUsername
            })

            await axios.post(`http://localhost:5000/api/friends/unfriend/${friendUsername}`, {
                username: user.username
            })

            if (res.status === 200) {
                console.log('Unfollowed friend successfully');
                setFriends(friends.filter(friend => friend !== friendUsername)); // Actualiza la lista de amigos
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
            {friends.length !== 0 ? (
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
            ) : (
                <p className="text-muted">No tienes amigos en tu lista.</p>
            )}
        </div>
    );
}

export default Friends;