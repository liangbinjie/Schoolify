import express from "express";
import { getClient } from "../db/cassandra.js";

const router = express.Router();

// Ruta para eliminar un archivo por ID
router.delete("/delete/:fileId", async (req, res) => {
    const { fileId } = req.params;

    try {
        const client = getClient(); // Asegúrate de que el cliente de Cassandra esté inicializado
        await client.execute("DELETE FROM files WHERE id = ?", [fileId]);

        res.status(200).json({ message: "Archivo eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar archivo:", error);
        res.status(500).json({ message: "Error al eliminar archivo" });
    }
});

export default router;