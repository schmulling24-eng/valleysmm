const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const Order = require('../models/Order');
const Service = require('../models/Service');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { auth, adminAuth } = require('../middleware/auth');

// Place order
router.post('/', auth, async (req, res) => {
  try {
    const { serviceId, link, quantity } = req.body;
    if (!serviceId || !link || !quantity) return res.status(400).json({ error: 'Service, link and quantity required' });

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) return res.status(404).json({ error: 'Service not found' });
    if (quantity < service.minOrder || quantity > service.maxOrder)
      return res.status(400).json({ error: `Quantity must be between ${service.minOrder} and ${service.maxOrder}` });

    const charge = parseFloat(((quantity / 1000) * service.rate).toFixed(2));
    const user = await User.findById(req.user._id);
    if (user.balance < charge) return res.status(400).json({ error: `Insufficient balance. Need KES ${charge}, have KES ${user.balance.toFixed(2)}` });

    // Deduct balance
    const balBefore = user.balance;
    user.balance = parseFloat((user.balance - charge).toFixed(2));
    user.totalSpent = parseFloat((user.totalSpent + charge).toFixed(2));
    user.totalOrders += 1;
    await user.save();

    const orderId = 'ORD-' + uuidv4().split('-')[0].toUpperCase();
    let upstreamOrderId = '';

    // Call upstream SMM API if configured
    if (process.env.SMM_API_KEY && service.upstreamId) {
      try {
        const resp = await axios.post(process.env.SMM_API_URL, null, {
          params: { key: process.env.SMM_API_KEY, action: 'add', service: service.upstreamId, link, quantity }
        });
        upstreamOrderId = resp.data?.order?.toString() || '';
      } catch (apiErr) { console.log('Upstream API error:', apiErr.message); }
    }

    const order = await Order.create({
      orderId, user: user._id, service: service._id,
      serviceId: service.serviceId, link, quantity, charge,
      status: upstreamOrderId ? 'Processing' : 'Pending',
      upstreamOrderId, remains: quantity
    });

    // Log transaction
    await Transaction.create({
      user: user._id, type: 'order', amount: -charge,
      balanceBefore: balBefore, balanceAfter: user.balance,
      description: `Order #${orderId} - ${service.name}`, reference: orderId
    });

    res.json({ order, newBalance: user.balance });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get user's orders
router.get('/my', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    const orders = await Order.find(filter)
      .populate('service', 'name platform category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Order.countDocuments(filter);
    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get single order status
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId, user: req.user._id })
      .populate('service', 'name platform category rate');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: Get all orders
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 30, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('service', 'name platform')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Order.countDocuments(filter);
    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: Update order status
router.put('/admin/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(order);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

module.exports = router;
