const router = require('express').Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

// Get transaction history
router.get('/transactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const txs = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Transaction.countDocuments({ user: req.user._id });
    res.json({ transactions: txs, total, pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: manually credit/debit user
router.post('/admin/adjust', adminAuth, async (req, res) => {
  try {
    const { userId, amount, type, description } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const balBefore = user.balance;
    user.balance = parseFloat((user.balance + parseFloat(amount)).toFixed(2));
    await user.save();
    await Transaction.create({
      user: userId, type: type || 'admin_credit', amount,
      balanceBefore: balBefore, balanceAfter: user.balance,
      description: description || 'Admin adjustment', status: 'completed'
    });
    res.json({ message: 'Balance updated', newBalance: user.balance });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
