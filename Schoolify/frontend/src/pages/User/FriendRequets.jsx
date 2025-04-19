import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";

function FriendRequests() {
    const { user, updateUser } = useAuth();
    const [requests, setRequests] = useState([]);

    const fetchUser = useCallback(async () => {
        if (!user?.username) return;
        try {
            const response = await axios.get(`http://localhost:5000/users/${user.username}`);
            const userData = response.data;
            updateUser(userData);
            setRequests(userData.receivedRequests || []);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }, []);
    
    useEffect(() => {
        console.log("Fetching user data for:", user);
        fetchUser();
    }, [fetchUser]);


    const declineHandler = async (friendUsername) => {
        try {
            await axios.post(`http://localhost:5000/api/friends/decline-friend-request/${friendUsername}`, {
                username: user.username,
            });
            fetchUser(); // refresh the list
        } catch (error) {
            console.error("Error declining friend request:", error);
        }
    }

    const acceptHandler = async (friendUsername) => {
        try {
            await axios.post(`http://localhost:5000/api/neo4j/accept-friend-request/`, {
                myUsername: user.username,
                friendUsername: friendUsername,
            });
            await axios.post(`http://localhost:5000/api/friends/accept-friend-request/${friendUsername}`, {
                username: user.username,
            });
            fetchUser(); // refresh the list
        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    }

    return (
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
                                        <button
                                            type="button"
                                            className="btn btn-success btn-sm float-end"
                                            onClick={() => acceptHandler(request)}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm float-end me-2"
                                            onClick={() => declineHandler(request)}
                                        >
                                            Decline
                                        </button>
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
    );
}

export default FriendRequests;
