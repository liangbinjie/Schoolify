import React from 'react';
import { useAuth } from '../../context/AuthProvider'; // Importa el contexto de autenticación

function Friends() {
    const { user } = useAuth(); // Obtener el usuario del contexto
    const friends = user.friends || []; // Obtener la lista de amigos del usuario


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
                                    className="btn btn-primary mt-2"
                                >
                                    Ver Perfil
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Friends;