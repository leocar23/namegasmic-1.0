// routes/orders.js
const express = require('express');
const router = express.Router();

// "BD" en memoria (demo)
let orders = [];

// Util: obtener la "orden actual" (la última creada)
function getCurrentOrder() {
  return orders.length ? orders[orders.length - 1] : null;
}

// Validar índice de ítem (sin optional chaining)
function validItemIndex(order, index) {
  const i = Number(index);
  const len = (order && order.items && order.items.length) ? order.items.length : 0;
  return Number.isInteger(i) && i >= 0 && i < len;
}

// ───────────────────────────────────────────────────────────
// Crear nueva orden
// body: { items: [{ name, price, currency, quantity }] }
// ───────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const body = req.body || {};
  const items = Array.isArray(body.items) ? body.items : [];

  const newOrder = {
    id: orders.length + 1,
    status: 'draft',
    items: items,
    createdAt: new Date().toISOString()
  };
  orders.push(newOrder);
  res.json(newOrder);
});

// Listar todas
router.get('/', (req, res) => {
  res.json(orders);
});

// Obtener la "orden actual"
router.get('/current', (req, res) => {
  const current = getCurrentOrder();
  if (!current) return res.status(404).json({ error: 'No hay orden activa' });
  res.json(current);
});

// Obtener por ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
  res.json(order);
});

// Añadir ítem a una orden existente
// POST /api/orders/:id/item
router.post('/:id/item', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

  const body = req.body || {};
  const name = body.name;
  const price = Number(body.price || 0);
  const currency = body.currency || 'EUR';
  const quantity = Number(body.quantity || 1);

  if (!name) return res.status(400).json({ error: 'Falta name' });

  if (!order.items) order.items = [];
  order.items.push({ name, price, currency, quantity });
  res.json(order);
});

// Actualizar cantidad de un ítem
// PUT /api/orders/:id/item/:index   body: { quantity }
router.put('/:id/item/:index', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = parseInt(req.params.index, 10);
  const body = req.body || {};
  const q = Number(body.quantity);

  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
  if (!validItemIndex(order, index)) return res.status(400).json({ error: 'Índice inválido' });
  if (!isFinite(q) || q < 0) return res.status(400).json({ error: 'Cantidad inválida' });

  if (q === 0) {
    order.items.splice(index, 1);
  } else {
    order.items[index].quantity = q;
  }
  res.json(order);
});

// Eliminar un ítem
// DELETE /api/orders/:id/item/:index
router.delete('/:id/item/:index', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = parseInt(req.params.index, 10);

  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
  if (!validItemIndex(order, index)) return res.status(400).json({ error: 'Índice inválido' });

  order.items.splice(index, 1);
  res.json(order);
});

// Vaciar todos los ítems de una orden
// DELETE /api/orders/:id/items
router.delete('/:id/items', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

  order.items = [];
  res.json(order);
});

// (Opcional) Cambiar estado
// PUT /api/orders/:id/status  body: { status }
router.put('/:id/status', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const body = req.body || {};
  const status = body.status;

  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
  if (!status) return res.status(400).json({ error: 'Falta status' });

  order.status = status;
  order.updatedAt = new Date().toISOString();
  res.json(order);
});

// ───────────────────────────────────────────────────────────
// Utilidades: calcular totales
// ───────────────────────────────────────────────────────────
function calcTotals(order, taxRate) {
  if (typeof taxRate !== 'number') taxRate = 0.21;
  const items = Array.isArray(order && order.items) ? order.items : [];
  let subtotal = 0;
  for (let i = 0; i < items.length; i++) {
    const it = items[i] || {};
    const qty = Number(it.quantity || 1);
    const price = Number(it.price || 0);
    subtotal += qty * price;
  }
  const tax = +(subtotal * taxRate).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), tax, total, taxRate };
}

// Checkout: guarda facturación y pasa a pending_payment
// POST /api/orders/:id/checkout
router.post('/:id/checkout', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

  const body = req.body || {};
  const billing = body.billing || {};
  const acceptTerms = !!body.acceptTerms;

  if (!acceptTerms) return res.status(400).json({ error: 'Debes aceptar los términos' });
  if (!billing.name || !billing.email) {
    return res.status(400).json({ error: 'Faltan nombre y/o email en la facturación' });
  }

  const totals = calcTotals(order);
  order.totals = totals;
  order.billing = {
    name: String(billing.name || '').trim(),
    email: String(billing.email || '').trim(),
    address: String(billing.address || '').trim(),
    city: String(billing.city || '').trim(),
    zip: String(billing.zip || '').trim(),
    country: String(billing.country || '').trim(),
    vat: String(billing.vat || '').trim()
  };
  order.status = 'pending_payment';
  order.updatedAt = new Date().toISOString();

  res.json({
    id: order.id,
    status: order.status,
    totals: order.totals,
    billing: order.billing,
    message: 'Orden lista para pago (pending_payment)'
  });
});

// Pago MOCK: pasa a paid
// POST /api/orders/:id/pay
router.post('/:id/pay', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

  if (order.status !== 'pending_payment') {
    return res.status(400).json({ error: 'La orden no está lista para pago (pending_payment)' });
  }

  if (!order.totals) {
    order.totals = calcTotals(order);
  }

  const body = req.body || {};
  const method = (body && body.method) ? body.method : 'mock';

  order.status = 'paid';
  order.paidAt = new Date().toISOString();
  order.payment = {
    method: method,
    transactionId: 'MOCK-' + order.id + '-' + Date.now()
  };
  order.updatedAt = new Date().toISOString();

  res.json({
    id: order.id,
    status: order.status,
    paidAt: order.paidAt,
    totals: order.totals,
    payment: order.payment,
    message: 'Pago confirmado (mock)'
  });
});

// Cancelar intento de pago: vuelve a draft
// POST /api/orders/:id/cancel-payment
router.post('/:id/cancel-payment', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

  if (order.status !== 'pending_payment') {
    return res.status(400).json({ error: 'Solo se puede cancelar desde pending_payment' });
  }

  order.status = 'draft';
  order.updatedAt = new Date().toISOString();
  res.json({ id: order.id, status: order.status, message: 'Pago cancelado (mock), orden a draft' });
});

module.exports = router;

