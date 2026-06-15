const router = require('express').Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Service = require('../models/Service');
const { adminAuth } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [users, orders, revenue, services] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Transaction.aggregate([{ $match: { type: 'deposit', status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Service.countDocuments({ isActive: true })
    ]);
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const [todayOrders, todayRevenue] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Transaction.aggregate([{ $match: { type: 'deposit', status: 'completed', createdAt: { $gte: todayStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);
    res.json({
      totalUsers: users, totalOrders: orders,
      totalRevenue: revenue[0]?.total || 0, totalServices: services,
      todayOrders, todayRevenue: todayRevenue[0]?.total || 0
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 30, search } = req.query;
    const filter = { role: 'user' };
    if (search) filter.$or = [{ name: new RegExp(search,'i') }, { email: new RegExp(search,'i') }];
    const users = await User.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(parseInt(limit)).select('-password');
    const total = await User.countDocuments(filter);
    res.json({ users, total, pages: Math.ceil(total/limit) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Suspend/activate user
router.put('/users/:id/toggle', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'suspended'}`, isActive: user.isActive });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
