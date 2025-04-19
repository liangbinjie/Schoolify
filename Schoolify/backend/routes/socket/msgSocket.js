import redis from '../../db/redis.js';

export default function setupSocketIO(io) {
  // Log when the socket server starts
  console.log('[Socket Server] Initializing...');

  io.on("connection", (socket) => {
    console.log("[Socket Server] New connection:", socket.id);
    
    // Store user information when they connect
    const userInfo = {
      id: socket.id,
      username: socket.handshake.query.username || 'anonymous',
      userId: socket.handshake.query.userId || null
    };
    
    console.log("[Socket Server] User connected:", userInfo);

    // Test Redis connection on user connect
    redis.ping().then(() => {
      console.log('[Redis] Connection test successful');
    }).catch(err => {
      console.error('[Redis] Connection test failed:', err);
    });
    
    // Join a personal room for direct messages
    if (userInfo.username !== 'anonymous') {
      socket.join(`user:${userInfo.username}`);
      console.log(`[Socket Server] User ${userInfo.username} joined personal room`);
    }

    // Handle joining a chat room
    socket.on("joinRoom", async ({ roomId }) => {
      try {
        console.log(`[Socket Server] User ${userInfo.username} joining room:`, roomId);
        socket.join(roomId);

        // Get message history from Redis
        const messages = await redis.lrange(`chat:${roomId}`, 0, -1);
        console.log(`[Redis] Retrieved ${messages.length} messages for room ${roomId}`);
        
        const parsed = messages.map((msg) => {
          try {
            return JSON.parse(msg);
          } catch (err) {
            console.error('[Redis] Error parsing message:', msg, err);
            return null;
          }
        }).filter(Boolean);

        console.log(`[Socket Server] Sending chat history to client:`, parsed);
        socket.emit("chatHistory", parsed);
      } catch (err) {
        console.error(`[Socket Server] Error in joinRoom:`, err);
      }
    });

    // Handle sending a message
    socket.on("sendMessage", async ({ roomId, message }) => {
      console.log(`[Socket Server] Received message:`, { roomId, message, userInfo });

      try {
        // Ensure message has required fields
        const messageData = {
          content: message.content,
          sender: message.sender,
          receiver: message.receiver,
          timestamp: message.timestamp || new Date().toISOString(),
          roomId
        };

        console.log("[Socket Server] Processed message data:", messageData);

        // Save message to Redis
        await redis.rpush(`chat:${roomId}`, JSON.stringify(messageData));
        console.log(`[Redis] Message saved for room ${roomId}`);

        // Emit message to all users in the room
        io.to(roomId).emit("receiveMessage", messageData);
        console.log(`[Socket Server] Message emitted to room ${roomId}`);

        // Also emit to recipient's personal room if they're not in the chat room
        if (messageData.receiver) {
          io.to(`user:${messageData.receiver}`).emit("newMessage", messageData);
          console.log(`[Socket Server] Message sent to recipient's personal room: ${messageData.receiver}`);
        }
      } catch (err) {
        console.error(`[Socket Server] Error handling message:`, err);
        // Notify the sender of the error
        socket.emit('messageError', { error: 'Failed to send message' });
      }
    });
    
    // Handle marking messages as read
    socket.on("markAsRead", async ({ roomId, username }) => {
      console.log(`[Socket Server] Marking messages as read in room ${roomId} by ${username}`);
      try {
        const messages = await redis.lrange(`chat:${roomId}`, 0, -1);
        const parsedMessages = messages.map(msg => JSON.parse(msg));
        
        const unreadMessages = parsedMessages.filter(msg => 
          msg.receiver === username && !msg.read
        );
        
        console.log(`[Socket Server] Found ${unreadMessages.length} unread messages`);
        
        if (unreadMessages.length > 0) {
          const updatedMessages = parsedMessages.map(msg => {
            if (msg.receiver === username && !msg.read) {
              return {
                ...msg,
                read: true,
                readAt: new Date().toISOString()
              };
            }
            return msg;
          });
          
          await redis.del(`chat:${roomId}`);
          await redis.rpush(`chat:${roomId}`, ...updatedMessages.map(msg => JSON.stringify(msg)));
          console.log(`[Redis] Updated ${updatedMessages.length} messages`);
          
          io.to(roomId).emit("messagesRead", {
            roomId,
            reader: username,
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("[Socket Server] Error marking messages as read:", err);
      }
    });
    
    // Handle typing indicators
    socket.on("typing", ({ roomId, username, isTyping }) => {
      console.log(`[Socket Server] Typing indicator from ${username} in room ${roomId}:`, isTyping);
      socket.to(roomId).emit("userTyping", { username, isTyping });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("[Socket Server] User disconnected:", userInfo.username);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('[Socket Server] Socket error:', error);
    });
  });
}
