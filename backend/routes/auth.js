const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password min 6 characters' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const apiKey = 'vsmm_' + uuidv4().replace(/-/g, '');
    const user = await User.create({ name, email, password, phone: phone || '', apiKey });
    const token = sign(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, balance: user.balance, role: user.role } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ error: 'Account suspended. Contact support.' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ error: 'Invalid email or password' });
    const token = sign(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, balance: user.balance, role: user.role } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// Update profile
router.put('/update', auth, async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (email) user.email = email;
    await user.save();
    res.json({ message: 'Profile updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Min 6 characters' });
    const user = await User.findById(req.user._id);
    const match = await user.comparePassword(currentPassword);
    if (!match) return res.status(400).json({ error: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Forgot password (placeholder - integrate nodemailer for real emails)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always return success to prevent email enumeration
    if (user) {
      const token = uuidv4();
      user.resetToken = token;
      user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
      await user.save();
      // TODO: Send email with reset link: /reset-password.html?token=TOKEN
      console.log(`Password reset token for ${email}: ${token}`);
    }
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Regenerate API key
router.post('/regen-key', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.apiKey = 'vsmm_' + uuidv4().replace(/-/g, '');
    await user.save();
    res.json({ apiKey: user.apiKey });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Min 6 characters' });
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
