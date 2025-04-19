import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketProvider';
import { useAuth } from '../context/AuthProvider';
import { Box, TextField, Button, Typography, Paper, Avatar } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

const MessageChat = ({ friendUsername, roomId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { sendMessage, onChatHistory, onReceiveMessage, sendTypingIndicator, typingUsers, joinRoom } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (roomId) {
      console.log(`[CLIENT] Uniendo al roomId: ${roomId}`);
      joinRoom(roomId);

      // Escuchar el historial de chat
      onChatHistory((history) => {
        console.log(`[DEBUG] Evento onChatHistory ejecutado para roomId: ${roomId}`);
        console.log(`[DEBUG] Historial recibido:`, history);
        setMessages(history); // Actualizar el estado con el historial
        scrollToBottom(); // Asegurarse de que la vista se desplace al final
      });
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      // Escuchar nuevos mensajes
      onReceiveMessage((newMessage) => {
        console.log(`[DEBUG] Evento onReceiveMessage ejecutado para roomId: ${roomId}`);
        console.log(`[DEBUG] Nuevo mensaje recibido:`, newMessage);
        if (newMessage.roomId === roomId) {
          setMessages((prev) => {
            const updatedMessages = [...prev, newMessage];
            console.log(`[CLIENT] Mensajes actuales en el chat (${roomId}):`, updatedMessages);
            return updatedMessages;
          });
          scrollToBottom();
        }
      });
    }
  }, [roomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && roomId) {
      const messageData = {
        content: message,
        sender: user._id,
        receiver: friendUsername,
        timestamp: new Date().toISOString()
      };
      sendMessage(roomId, messageData);
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

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(roomId, false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage(e);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar>{friendUsername?.[0]?.toUpperCase()}</Avatar>
          <Box>
            <Typography variant="h6">{friendUsername}</Typography>
            {typingUsers[friendUsername] && (
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
              justifyContent: msg.sender === user.username ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '70%',
                bgcolor: msg.sender === user.username ? 'primary.main' : 'grey.100',
                color: msg.sender === user.username ? 'white' : 'text.primary',
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
          borderColor: 'divider',
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
          onKeyPress={handleKeyPress}
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