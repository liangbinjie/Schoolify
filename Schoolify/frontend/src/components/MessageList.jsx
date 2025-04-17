import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import axios from 'axios';

const MessageList = ({ onSelectChat }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        // Get friends from the user object
        const userFriends = user.friends || [];
        setFriends(userFriends);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching friends:', error);
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user]);

  const handleSelectFriend = (friendUsername) => {
    // Create a unique room ID for the chat
    const roomId = [user.username, friendUsername].sort().join('-');
    onSelectChat(friendUsername, roomId);
  };

  if (loading) {
    return <div className="text-center p-3">Cargando Amigos...</div>;
  }

  return (
    <div className="message-list">
      <h5 className="p-3 border-bottom">Tus Amigos</h5>
      {friends.length === 0 ? (
        <div className="p-3 text-center text-muted">
          No tienes amigos aún. 
          <button 
            className="btn btn-link p-0 ml-1" 
            onClick={() => navigate('/amigos')}
          >
            Encuentra amigos
          </button>
        </div>
      ) : (
        <ul className="list-group list-group-flush">
          {friends.map((friend) => (
            <li 
              key={friend} 
              className="list-group-item list-group-item-action d-flex align-items-center p-3 cursor-pointer"
              onClick={() => handleSelectFriend(friend)}
              style={{ cursor: 'pointer' }}
            >
              <div className="avatar-circle bg-primary text-white me-3">
                {friend.charAt(0).toUpperCase()}
              </div>
              <div>
                <h6 className="mb-0">{friend}</h6>
                <small className="text-muted">Haz click para chatear</small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MessageList; 