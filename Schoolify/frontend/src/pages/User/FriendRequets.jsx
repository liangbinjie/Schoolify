import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { useAuth } from "../../context/AuthProvider"; // Importa el contexto de autenticación

function FriendRequests() {
    const { user, updateUser } = useAuth(); // Obtener el usuario del contexto
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        if (user && user.receivedRequests) {
            setRequests(user.receivedRequests);
        }
    }, [user]);

    user.receivedRequests.map((request) => (
        console.log(request)
    ))

    const declineHandler = async (friendUsername) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/friends/decline-friend-request/${friendUsername}`, {
                username: user.username,
            });
            console.log(response.data);
    
            // Update global context if needed
            updateUser(response.data.user);
    
            // Remove from local state
            setRequests(prev => prev.filter(req => req !== friendUsername));
        } catch (error) {
            console.error("Error declining friend request:", error);
        }
    }

    const acceptHandler = async (friendUsername) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/friends/accept-friend-request/${friendUsername}`, {
                username: user.username,
            });
            console.log(response.data);
    
            // Update global context if needed
            updateUser(response.data.user);
    
            // Remove from local state
            setRequests(prev => prev.filter(req => req !== friendUsername));
        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    }


    return (
        <>
            <div className="container mt-5">
                <h1>Friend Requests</h1>
                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Friend Requests</h5>
                                {requests.length > 0 ? (
                                    requests.map((request) => (
                                        <div key={request} className="alert alert-primary" role="alert">
                                            {request}
                                            <button type="button" className="btn btn-success btn-sm float-end" onClick={() => acceptHandler(request)}>Accept</button>
                                            <button type="button" className="btn btn-danger btn-sm float-end me-2" onClick={() => declineHandler(request)}>Decline</button>
                                        </div>
                                    ))
                                ) : (
                                    <p>No friend requests.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default FriendRequests;