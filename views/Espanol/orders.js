const express = require('express');
const router = express.Router();

// 🔹 "Base de datos" temporal en memoria
let orders = [];

// Crear nueva orden
router.post('/', (req, res) => {
  const { items } = req.body; // los items que vienen del front
  const newOrder = {
    id: orders.length + 1,
    status: 'draft',
    items,
    createdAt: new Date()
  };
  orders.push(newOrder);
  res.json(newOrder);
});

// Obtener todas las órdenes
router.get('/', (req, res) => {
  res.json(orders);
});

// Obtener orden por ID
router.get('/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
  res.json(order);
});

module.exports = router;
