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
                  borderRadius: 2,
                  bgcolor: isSentByMe ? '#0084FF' : '#E4E6EB',
                  color: isSentByMe ? 'white' : 'text.primary',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    ...(isSentByMe ? {
                      borderWidth: '8px 0 8px 8px',
                      borderColor: 'transparent transparent transparent #0084FF',
                      right: -8,
                      top: '50%',
                      transform: 'translateY(-50%)'
                    } : {
                      borderWidth: '8px 8px 8px 0',
                      borderColor: 'transparent #E4E6EB transparent transparent',
                      left: -8,
                      top: '50%',
                      transform: 'translateY(-50%)'
                    })
                  }
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.content}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 0.5,
                    opacity: 0.8,
                    fontSize: '0.7rem'
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
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3
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
            bgcolor: '#0084FF',
            '&:hover': {
              bgcolor: '#0073E6'
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