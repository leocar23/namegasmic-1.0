// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// 🔹 ID de usuario temporal para pruebas
const testUserId = "64f8c3a2b1e4f123456789ab"; // reemplaza con un ObjectId real de un usuario

// Crear una nueva orden
router.post("/", async (req, res) => {
  try {
    const { domain, amount } = req.body;

    const newOrder = new Order({
      userId: testUserId, // temporal para pruebas
      domain,
      amount,
      status: "pending"
    });

    await newOrder.save();

    res.json({
      message: "Orden creada correctamente",
      order: newOrder
    });
  } catch (error) {
    console.error("Error al crear orden:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Consultar órdenes de prueba
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({ userId: testUserId });
    res.json(orders);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
