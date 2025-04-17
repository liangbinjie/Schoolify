import React, { useState } from 'react';
import MessageList from '../../components/MessageList';
import MessageChat from '../../components/MessageChat';

const Messages = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [roomId, setRoomId] = useState(null);

  const handleSelectChat = (friendUsername, chatRoomId) => {
    setSelectedFriend(friendUsername);
    setRoomId(chatRoomId);
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
            {selectedFriend ? (
              <MessageChat 
                friendUsername={selectedFriend} 
                roomId={roomId} 
              />
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