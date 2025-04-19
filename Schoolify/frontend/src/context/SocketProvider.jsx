import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
      // Conexion con el socket
      const newSocket = io('http://localhost:5000', {
        query: {
          userId: user._id,
          username: user.username
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      // Set up event listeners
      newSocket.on('connect', () => {
        console.log('[Socket] Connected to server');
      });

      newSocket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error);
      });

      newSocket.on('disconnect', () => {
        console.log('[Socket] Disconnected from server');
      });

      setSocket(newSocket);

      return () => {
        console.log('[Socket] Cleaning up connection');
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  // Function to join a chat room
  const joinRoom = useCallback((roomId) => {
    if (socket) {
      console.log('[Socket] Joining room:', roomId);
      socket.emit('joinRoom', { roomId });
    }
  }, [socket]);

  // Function to send a message
  const sendMessage = useCallback((roomId, content) => {
    if (socket && user) {
      const messageData = {
        content: content,
        sender: user._id,
        receiver: roomId.split('-').find(id => id !== user._id),
        timestamp: new Date().toISOString()
      };
      console.log('[Socket] Sending message:', { roomId, messageData });
      socket.emit('sendMessage', { roomId, message: messageData });
    }
  }, [socket, user]);

  // Function to mark messages as read
  const markAsRead = useCallback((roomId) => {
    if (socket && user) {
      console.log('[Socket] Marking messages as read:', roomId);
      socket.emit('markAsRead', { roomId, username: user.username });
    }
  }, [socket, user]);

  // Function to send typing indicator
  const sendTypingIndicator = useCallback((roomId, isTyping) => {
    if (socket && user) {
      socket.emit('typing', { roomId, username: user.username, isTyping });
    }
  }, [socket, user]);

  // Function to listen for chat history
  const onChatHistory = useCallback((callback) => {
    if (socket) {
      socket.off('chatHistory').on('chatHistory', callback);
    }
  }, [socket]);

  // Function to listen for new messages
  const onReceiveMessage = useCallback((callback) => {
    if (socket) {
      socket.off('receiveMessage').on('receiveMessage', callback);
    }
  }, [socket]);

  // Function to clear unread messages
  const clearUnreadMessages = useCallback((roomId) => {
    setUnreadMessages(prev => prev.filter(msg => msg.roomId !== roomId));
  }, []);

  // Set up global message listeners
  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message) => {
        console.log('[Socket] New message received:', message);
        setUnreadMessages(prev => [...prev, message]);
      });

      socket.on('userTyping', ({ username, isTyping }) => {
        setTypingUsers(prev => ({
          ...prev,
          [username]: isTyping
        }));
      });

      return () => {
        socket.off('newMessage');
        socket.off('userTyping');
      };
    }
  }, [socket]);

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
        typingUsers
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);