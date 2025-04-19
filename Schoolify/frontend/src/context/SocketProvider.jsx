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

      // Listen for new messages when not in the chat room
      newSocket.on('newMessage', (message) => {
        console.log('New message received:', message);
        setUnreadMessages(prev => [...prev, message]);
      });

      // Listen for messages in the chat room
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
      console.log('Joining room:', roomId);
      socket.emit('joinRoom', { roomId });
    }
  };

  // Function to send a message
  const sendMessage = (roomId, message) => {
    if (socket) {
      console.log('Sending message to room:', roomId, message);
      socket.emit('sendMessage', { roomId, message });
    }
  };

  // Function to mark messages as read
  const markAsRead = (roomId) => {
    if (socket && user) {
      console.log('Marking messages as read in room:', roomId);
      socket.emit('markAsRead', { roomId, username: user.username });
    }
  };

  // Function to send typing indicator
  const sendTypingIndicator = (roomId, isTyping) => {
    if (socket && user) {
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