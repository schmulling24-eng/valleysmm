require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use('/api/orders', rateLimit({ windowMs: 60 * 1000, max: 30 }));

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth',     require('./backend/routes/auth'));
app.use('/api/services', require('./backend/routes/services'));
app.use('/api/orders',   require('./backend/routes/orders'));
app.use('/api/mpesa',    require('./backend/routes/mpesa'));
app.use('/api/wallet',   require('./backend/routes/wallet'));
app.use('/api/admin',    require('./backend/routes/admin'));

// Catch-all: serve HTML pages
app.get('*', (req, res) => {
  const page = req.path.replace('/', '') || 'index';
  const filePath = path.join(__dirname, 'public', `${page}.html`);
  const fs = require('fs');
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect DB and start
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/valleysmm')
  .then(() => {
    console.log('✅ MongoDB connected');
    seedAdmin();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Valley SMM running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('DB Error:', err));

// Seed default admin account
async function seedAdmin() {
  const User = require('./backend/models/User');
  const exists = await User.findOne({ role: 'admin' });
  if (!exists) {
    await User.create({ name: 'Admin', email: process.env.ADMIN_EMAIL || 'admin@valleysmm.co.ke', password: 'Admin@1234', role: 'admin', isVerified: true });
    console.log('👤 Admin created: admin@valleysmm.co.ke / Admin@1234  ← CHANGE THIS!');
  }
}
