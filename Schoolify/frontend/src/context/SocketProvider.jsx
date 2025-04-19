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
      // Conexion con el socket
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

      // Listen for new messages when not in the chat room
      newSocket.on('newMessage', (message) => {
        console.log('New message received:', message);
        setUnreadMessages(prev => [...prev, message]);
      });

      // Escuchar nuevos mensajes
      newSocket.on('receiveMessage', (message) => {
        console.log('Message received in room:', message);
        // The MessageChat component will handle updating its messages state  
      });

      // Listen for chat history
      newSocket.on('chatHistory', (history) => {
        console.log('Chat history received:', history);
        // The MessageChat component will handle updating its messages state
      });

      // Listen for typing indicators
      newSocket.on('userTyping', ({ username, isTyping }) => {
        setTypingUsers(prev => ({
          ...prev,
          [username]: isTyping
        }));
      });

      // Listen for read receipts
      newSocket.on('messagesRead', ({ roomId, reader, timestamp }) => {
        console.log(`Messages in room ${roomId} were read by ${reader} at ${timestamp}`);
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
      console.log('[SocketProvider] Joining room:', roomId);
      socket.emit('joinRoom', { roomId });
    } else {
      console.error('[SocketProvider] Cannot join room - socket not connected');
    }
  };

  // Function to send a message
  const sendMessage = (roomId, message) => {
    if (socket) {
      console.log('[SocketProvider] Sending message:', { roomId, message });
      socket.emit('sendMessage', { roomId, message });
    } else {
      console.error('[SocketProvider] Cannot send message - socket not connected');
    }
  };

  // Function to mark messages as read
  const markAsRead = (roomId) => {
    if (socket && user) {
      console.log('[SocketProvider] Marking messages as read:', { roomId, username: user.username });
      socket.emit('markAsRead', { roomId, username: user.username });
    } else {
      console.error('[SocketProvider] Cannot mark messages as read - socket not connected or user not available');
    }
  };

  // Function to send typing indicator
  const sendTypingIndicator = (roomId, isTyping) => {
    if (socket && user) {
      console.log('[SocketProvider] Sending typing indicator:', { roomId, username: user.username, isTyping });
      socket.emit('typing', { roomId, username: user.username, isTyping });
    } else {
      console.error('[SocketProvider] Cannot send typing indicator - socket not connected or user not available');
    }
  };

  // Function to listen for chat history
  const onChatHistory = (callback) => {
    if (socket) {
      console.log('[SocketProvider] Setting up chat history listener');
      socket.on('chatHistory', (history) => {
        console.log('[SocketProvider] Received chat history:', history);
        callback(history);
      });
    } else {
      console.error('[SocketProvider] Cannot set up chat history listener - socket not connected');
    }
  };

  // Function to listen for new messages
  const onReceiveMessage = (callback) => {
    if (socket) {
      console.log('[SocketProvider] Setting up message receiver');
      socket.on('receiveMessage', (message) => {
        console.log('[SocketProvider] Received message:', message);
        callback(message);
      });
    } else {
      console.error('[SocketProvider] Cannot set up message receiver - socket not connected');
    }
  };

  // Function to clear unread messages
  const clearUnreadMessages = (roomId) => {
    setUnreadMessages(prev => prev.filter(msg => msg.roomId !== roomId));
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
        typingUsers
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);