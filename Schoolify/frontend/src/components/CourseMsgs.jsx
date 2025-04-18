import React from 'react';
import { useAuth } from "../context/AuthProvider";

function CourseMsgs({ courseId, teacherId }) {
    const { user } = useAuth(); // usuario logueado
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");
  
    // Obtener mensajes del curso
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/messages/course/${courseId}`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error al obtener mensajes:", error);
      }
    };
  
    useEffect(() => {
      fetchMessages();
    }, [courseId]);
  
    // Enviar mensaje
    const handleSend = async (e) => {
      e.preventDefault();
      if (!content.trim()) return;
  
      try {
        const response = await fetch("http://localhost:5000/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: user._id,
            receiver: teacherId,
            course: courseId,
            content: content,
          }),
        });
  
        if (!response.ok) {
          throw new Error("Error al enviar mensaje");
        }
  
        setContent("");
        fetchMessages(); // Actualizar lista
      } catch (error) {
        console.error("Error al enviar mensaje:", error);
      }
    };
  
    return (
      <div className="mt-5">
        <h5>Consultas al docente</h5>
        <form onSubmit={handleSend} className="mb-3">
          <textarea
            className="form-control"
            placeholder="Escribe tu mensaje..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <button className="btn btn-primary mt-2" type="submit">Enviar</button>
        </form>
  
        <div className="card">
          <div className="card-body">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div key={msg._id} className="mb-3">
                  <strong>{msg.sender?.username || "Usuario"}:</strong> {msg.content}
                  <br />
                  <small className="text-muted">{new Date(msg.timestamp).toLocaleString()}</small>
                </div>
              ))
            ) : (
              <p>No hay mensajes aún.</p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  export default CourseMsgs;

