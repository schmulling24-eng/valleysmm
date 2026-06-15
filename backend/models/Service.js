const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  platform: { type: String, required: true },
  type: { type: String, default: 'Default' },
  rate: { type: Number, required: true },   // KES per 1000
  minOrder: { type: Number, required: true },
  maxOrder: { type: Number, required: true },
  description: { type: String, default: '' },
  dripFeed: { type: Boolean, default: false },
  refill: { type: Boolean, default: false },
  cancel: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  upstreamId: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
