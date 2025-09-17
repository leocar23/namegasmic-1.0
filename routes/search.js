// routes/search.js
const express = require("express");
const router = express.Router();
const DomainQuery = require("../models/DomainQuery");

// 🔹 ID de usuario temporal para pruebas
const testUserId = "64f8c3a2b1e4f123456789ab"; // reemplaza con un ObjectId real de tu usuario en MongoDB

// Ruta POST para registrar búsquedas de dominio
router.post("/", async (req, res) => {
  try {
    const { domain } = req.body;

    // ⚡ Ejemplo temporal: todos los dominios se consideran disponibles
    const available = true;

    // Guardar la búsqueda en la base de datos
    const newQuery = new DomainQuery({
      userId: testUserId, // temporal para pruebas
      domain,
      available
    });

    await newQuery.save();

    res.json({
      message: "Consulta guardada",
      domain,
      available
    });
  } catch (error) {
    console.error("Error al guardar consulta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;

