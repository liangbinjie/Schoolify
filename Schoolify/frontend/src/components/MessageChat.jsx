import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketProvider';
import { useAuth } from '../context/AuthProvider';
import { useTheme } from '../context/ThemeProvider';
import { Box, TextField, Button, Typography, Paper, Avatar, IconButton } from '@mui/material';
import { Send as SendIcon, DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';

const MessageChat = ({ selectedUser }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { socket, joinRoom, sendMessage, markAsRead, sendTypingIndicator, onChatHistory, onReceiveMessage, typingUsers } = useSocket();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  // Create room ID only if both user IDs are available
  const roomId = user?._id && selectedUser?._id
    ? [user._id, selectedUser._id].sort().join('-')
    : null;

  useEffect(() => {
    console.log('[Chat] Current user:', user);
    console.log('[Chat] Selected user:', selectedUser);
    console.log('[Chat] Room ID:', roomId);

    if (!user?._id || !selectedUser?._id) {
      console.error('[Chat] Missing user IDs:', {
        currentUserId: user?._id,
        selectedUserId: selectedUser?._id
      });
      return;
    }

    if (roomId) {
      console.log('[Chat] Joining room:', roomId);
      joinRoom(roomId);
      markAsRead(roomId);

      const handleChatHistory = (history) => {
        console.log('[Chat] Received history:', history);
        setMessages(history || []);
        scrollToBottom();
      };

      const handleNewMessage = (newMessage) => {
        console.log('[Chat] Received new message:', newMessage);
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();

        if (newMessage.sender !== user._id) {
          markAsRead(roomId);
        }
      };

      onChatHistory(handleChatHistory);
      onReceiveMessage(handleNewMessage);

      return () => {
        setMessages([]);
      };
    }
  }, [roomId, user?._id, selectedUser?._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !roomId) {
      console.error('[Chat] Cannot send message:', {
        hasMessage: Boolean(message.trim()),
        roomId
      });
      return;
    }

    console.log('[Chat] Sending message:', {
      roomId,
      content: message.trim(),
      sender: user._id,
      receiver: selectedUser._id
    });

    sendMessage(roomId, message.trim());
    setMessage('');
    setIsTyping(false);
    sendTypingIndicator(roomId, false);
    scrollToBottom();
  };

  const handleTyping = () => {
    if (!roomId) {
      console.error('[Chat] Cannot send typing indicator: No room ID');
      return;
    }

    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(roomId, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(roomId, false);
    }, 1000);
  };

  if (!user?._id || !selectedUser?._id) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Loading chat...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: isDarkMode ? '#121212' : '#FFFFFF'
    }}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: isDarkMode ? '#1E1E1E' : '#FFFFFF'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={selectedUser?.profilePicture} alt={selectedUser?.username}>
            {selectedUser?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" color={isDarkMode ? 'white' : 'text.primary'}>
              {selectedUser?.username}
            </Typography>
            {typingUsers[selectedUser?.username] && (
              <Typography variant="caption" color={isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'textSecondary'}>
                typing...
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton onClick={toggleTheme} sx={{ color: isDarkMode ? 'white' : 'text.primary' }}>
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Paper>

      <Box sx={{
        flexGrow: 1,
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {messages.map((msg, index) => {
          const isSentByMe = msg.sender === user._id;
          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: isSentByMe ? 'flex-end' : 'flex-start',
                width: '100%'
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  maxWidth: '70%',
                  borderRadius: isSentByMe ? '20px 20px 0px 20px' : '20px 20px 20px 0px',
                  bgcolor: isSentByMe
                    ? (isDarkMode ? '#E0E0E0' : '#F5F5F5')
                    : (isDarkMode ? '#2D2D2D' : '#FFFFFF'),
                  color: isSentByMe
                    ? (isDarkMode ? '#000000' : '#000000')
                    : (isDarkMode ? '#FFFFFF' : '#000000'),
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.4
                  }}
                >
                  {msg.content}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    opacity: 0.7,
                    fontSize: '0.7rem',
                    color: isSentByMe
                      ? (isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)')
                      : (isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)')
                  }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Paper>
            </Box>
          );
        })}
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
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'divider',
          bgcolor: isDarkMode ? '#1E1E1E' : '#FFFFFF'
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
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: isDarkMode ? '#2D2D2D' : '#FFFFFF',
              color: isDarkMode ? 'white' : 'text.primary',
              '& fieldset': {
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
              },
              '&:hover fieldset': {
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              },
            },
            '& .MuiInputBase-input': {
              color: isDarkMode ? 'white' : 'text.primary',
            },
            '& .MuiInputBase-input::placeholder': {
              color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            }
          }}
        />
        <Button
          type="submit"
          variant="contained"
          endIcon={<SendIcon />}
          disabled={!message.trim()}
          sx={{
            borderRadius: 2,
            bgcolor: isDarkMode ? '#FFFFFF' : '#000000',
            color: isDarkMode ? '#000000' : '#FFFFFF',
            '&:hover': {
              bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'
            }
          }}
        >
          Send
        </Button>
      </Paper>
    </Box>
  );
};

export default MessageChat;