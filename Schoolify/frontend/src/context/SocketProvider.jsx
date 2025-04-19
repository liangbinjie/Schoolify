import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthProvider';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io('http://localhost:5173', {
        query: {
          userId: user._id,
          username: user.username,
        },
      });

      newSocket.on('connect', () => {
        console.log('[SocketProvider] Connected to socket server');
      });

      newSocket.on('disconnect', () => {
        console.log('[SocketProvider] Disconnected from socket server');
      });

      // Escuchar historial de chat
      newSocket.on('chatHistory', (history) => {
        console.log('[SocketProvider] Historial recibido:', history);
      });

      // Escuchar nuevos mensajes
      newSocket.on('receiveMessage', (message) => {
        console.log('[SocketProvider] Nuevo mensaje recibido:', message);
        setUnreadMessages((prev) => [...prev, message]);
      });

      // Escuchar usuarios escribiendo
      newSocket.on('typing', ({ roomId, username, isTyping }) => {
        console.log(`[SocketProvider] ${username} está ${isTyping ? 'escribiendo' : 'no escribiendo'} en la sala ${roomId}`);
        setTypingUsers((prev) => ({
          ...prev,
          [roomId]: isTyping ? username : null,
        }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (socket) {
      socket.on('receiveMessage', (message) => {
        console.log(`[SocketProvider] Nuevo mensaje recibido:`, message);
        setUnreadMessages((prev) => [...prev, message]);
      });
    }
  }, [socket]);

  // Function to join a chat room
  const joinRoom = (roomId) => {
    if (socket) {
      console.log(`[SocketProvider] Uniéndose a la sala: ${roomId}`);
      socket.emit('joinRoom', { roomId });
    }
  };

  // Function to send a message
  const sendMessage = (roomId, message) => {
    if (socket) {
      console.log('[SocketProvider] Enviando mensaje:', { roomId, message });
      socket.emit('sendMessage', { roomId, message });
    }
  };

  // Function to mark messages as read
  const markAsRead = (roomId) => {
    if (socket && user) {
      console.log(`[SocketProvider] Marcando mensajes como leídos en la sala: ${roomId}`);
      socket.emit('markAsRead', { roomId, username: user.username });
    }
  };

  // Function to send typing indicator
  const sendTypingIndicator = (roomId, isTyping) => {
    if (socket && user) {
      console.log(`[SocketProvider] Indicador de escritura enviado: ${isTyping ? 'escribiendo' : 'no escribiendo'} en la sala ${roomId}`);
      socket.emit('typing', { roomId, username: user.username, isTyping });
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

  // Function to clear unread messages
  const clearUnreadMessages = (roomId) => {
    setUnreadMessages((prev) => prev.filter((msg) => msg.roomId !== roomId));
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        joinRoom,
        sendMessage,
        markAsRead,
        sendTypingIndicator,
        onChatHistory,
        onReceiveMessage,
        unreadMessages,
        clearUnreadMessages,
        typingUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);