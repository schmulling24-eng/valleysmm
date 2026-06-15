const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit','order','refund','admin_credit','admin_debit'], required: true },
  amount: { type: Number, required: true },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  description: { type: String, default: '' },
  mpesaCode: { type: String, default: '' },
  mpesaPhone: { type: String, default: '' },
  status: { type: String, enum: ['pending','completed','failed'], default: 'completed' },
  reference: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
