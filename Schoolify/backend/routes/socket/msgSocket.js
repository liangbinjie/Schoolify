import redisCluster from "../db/redisCluster.js"; 

export default function setupSocketIO(io) {
  io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    socket.on("joinRoom", async ({ roomId }) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} se unió a sala: ${roomId}`);

      // Obtener historial de mensajes desde Redis Cluster
      try {
        const messages = await redisCluster.lrange(`chat:${roomId}`, 0, -1);
        const parsed = messages.map((msg) => JSON.parse(msg));
        socket.emit("chatHistory", parsed);
      } catch (err) {
        console.error("Error al obtener historial:", err);
      }
    });

    socket.on("sendMessage", async ({ roomId, message }) => {
      try {
        // Guardar en Redis Cluster
        await redisCluster.rpush(`chat:${roomId}`, JSON.stringify(message));

        // Emitir en tiempo real a todos los usuarios en esa sala
        io.to(roomId).emit("receiveMessage", message);
      } catch (err) {
        console.error("Error al guardar/enviar mensaje:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Usuario desconectado:", socket.id);
    });
  });
}
