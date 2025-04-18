import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketProvider';
import { useAuth } from '../context/AuthProvider';
import { Box, TextField, Button, Typography, Paper, Avatar } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

const MessageChat = ({ selectedUser }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { socket, joinRoom, sendMessage, markAsRead, sendTypingIndicator, onChatHistory, onReceiveMessage, typingUsers } = useSocket();
  const { user } = useAuth();

  const roomId = selectedUser ? [user._id, selectedUser._id].sort().join('-') : null;

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
      markAsRead(roomId);

      // Listen for chat history
      onChatHistory((history) => {
        setMessages(history);
        scrollToBottom();
      });

      // Listen for new messages
      onReceiveMessage((newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();
      });
    }
  }, [roomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && roomId) {
      sendMessage(roomId, message);
      setMessage('');
      setIsTyping(false);
      sendTypingIndicator(roomId, false);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(roomId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(roomId, false);
    }, 1000);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={selectedUser?.profilePicture} alt={selectedUser?.username}>
            {selectedUser?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6">{selectedUser?.username}</Typography>
            {typingUsers[selectedUser?.username] && (
              <Typography variant="caption" color="textSecondary">
                typing...
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: msg.sender === user._id ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '70%',
                bgcolor: msg.sender === user._id ? 'primary.main' : 'grey.100',
                color: msg.sender === user._id ? 'white' : 'text.primary'
              }}
            >
              <Typography variant="body1">{msg.content}</Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Paper
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          display: 'flex',
          gap: 1,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          size="small"
        />
        <Button
          type="submit"
          variant="contained"
          endIcon={<SendIcon />}
          disabled={!message.trim()}
        >
          Send
        </Button>
      </Paper>
    </Box>
  );
};

export default MessageChat; 