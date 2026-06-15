const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  serviceId: String,
  link: { type: String, required: true },
  quantity: { type: Number, required: true },
  charge: { type: Number, required: true },
  startCount: { type: Number, default: 0 },
  remains: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Pending','Processing','In Progress','Completed','Partial','Cancelled','Refunded'],
    default: 'Pending'
  },
  upstreamOrderId: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
