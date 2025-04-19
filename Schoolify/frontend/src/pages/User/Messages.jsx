import React, { useState } from 'react';
import MessageList from '../../components/MessageList';
import MessageChat from '../../components/MessageChat';
import axios from 'axios';

const Messages = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSelectChat = async (friendUsername) => {
    try {
      // Fetch complete user data when a friend is selected
      const response = await axios.get(`http://localhost:5000/users/${friendUsername}`);
      setSelectedUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-secondary display-5">Mensajes</h2>
      <p className="text-muted lead">Chatear con tus amigos</p>
      <hr />
      
      <div className="row">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <MessageList onSelectChat={handleSelectChat} />
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card shadow-sm h-100">
            {selectedUser ? (
              <MessageChat selectedUser={selectedUser} />
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100 p-5 text-center">
                <div>
                  <h4 className="text-muted">Selecciona un amigo para chatear</h4>
                  <p className="text-muted">Elige un amigo de la lista de la izquierda</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages; 