import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketProvider';
import { useAuth } from '../context/AuthProvider';

const MessageChat = ({ friendUsername, roomId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { joinRoom, sendMessage, onChatHistory, onReceiveMessage } = useSocket();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (roomId) {
      setLoading(true);
      
      // Unirse a la sala de chat
      joinRoom(roomId);
      
      // historial de chat
      onChatHistory((history) => {
        setMessages(history);
        setLoading(false);
      });
      
      // nuevos mensajes
      onReceiveMessage((message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }
  }, [roomId, joinRoom, onChatHistory, onReceiveMessage]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (newMessage.trim() && roomId) {
      const messageData = {
        sender: user.username,
        receiver: friendUsername,
        content: newMessage,
        timestamp: new Date().toISOString()
      };
      
      // Send the message
      sendMessage(roomId, messageData);
      
      // Clear the input
      setNewMessage('');
    }
  };

  if (loading) {
    return <div className="text-center p-3">Cargando mensajes...</div>;
  }

  return (
    <div className="message-chat d-flex flex-column h-100">
      <div className="chat-header p-3 border-bottom">
        <h5 className="mb-0">Chatear con: {friendUsername}</h5>
      </div>
      
      <div className="chat-messages flex-grow-1 p-3 overflow-auto" style={{ maxHeight: '400px' }}>
        {messages.length === 0 ? (
          <div className="text-center text-muted mt-4">
            No hay mensajes aún. ¡Inicia la conversación!
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.sender === user.username ? 'sent' : 'received'} mb-3`}
            >
              <div 
                className={`message-bubble p-2 rounded ${
                  message.sender === user.username 
                    ? 'bg-primary text-white ms-auto' 
                    : 'bg-light'
                }`}
                style={{ maxWidth: '75%' }}
              >
                <div className="message-content">{message.content}</div>
                <small className="message-time text-muted">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </small>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="chat-input p-3 border-top">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageChat; 