import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthProvider';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to the socket server
      const newSocket = io('http://localhost:5000', {
        query: {
          userId: user._id,
          username: user.username
        }
      });

      // Set up event listeners
      newSocket.on('connect', () => {
        console.log('Connected to socket server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });

      setSocket(newSocket);

      // Clean up on unmount
      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  // Function to join a chat room
  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('joinRoom', { roomId });
    }
  };

  // Function to send a message
  const sendMessage = (roomId, message) => {
    if (socket) {
      socket.emit('sendMessage', { roomId, message });
    }
  };

  // Function to listen for chat history
  const onChatHistory = (callback) => {
    if (socket) {
      socket.on('chatHistory', callback);
    }
  };

  // Function to listen for new messages
  const onReceiveMessage = (callback) => {
    if (socket) {
      socket.on('receiveMessage', callback);
    }
  };

  return (
    <SocketContext.Provider 
      value={{ 
        socket, 
        joinRoom, 
        sendMessage, 
        onChatHistory, 
        onReceiveMessage 
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext); 