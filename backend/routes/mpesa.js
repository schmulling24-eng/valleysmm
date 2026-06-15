const router = require('express').Router();
const axios = require('axios');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

// Get M-Pesa OAuth token
async function getMpesaToken() {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const resp = await axios.get('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { Authorization: `Basic ${auth}` }
  });
  return resp.data.access_token;
}

// STK Push - prompt user's phone with M-Pesa payment request
router.post('/stk-push', auth, async (req, res) => {
  try {
    const { phone, amount } = req.body;
    if (!phone || !amount) return res.status(400).json({ error: 'Phone and amount required' });
    if (amount < 10) return res.status(400).json({ error: 'Minimum deposit is KES 10' });

    const token = await getMpesaToken();
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
    const cleanPhone = phone.replace(/^0/, '254').replace(/^\+/, '');

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount),
      PartyA: cleanPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: cleanPhone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: '1289011060',
      TransactionDesc: 'Valley SMM Wallet Top-up'
    };

    const resp = await axios.post(
      'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Save pending transaction
    await Transaction.create({
      user: req.user._id, type: 'deposit', amount,
      balanceBefore: req.user.balance, balanceAfter: req.user.balance,
      description: 'M-Pesa deposit (pending)', mpesaPhone: cleanPhone,
      status: 'pending', reference: resp.data.CheckoutRequestID
    });

    res.json({ message: 'STK Push sent! Check your phone and enter M-Pesa PIN.', checkoutId: resp.data.CheckoutRequestID });
  } catch (e) {
    res.status(500).json({ error: 'M-Pesa error: ' + (e.response?.data?.errorMessage || e.message) });
  }
});

// M-Pesa Callback (Safaricom calls this after payment)
router.post('/callback', async (req, res) => {
  try {
    const { Body } = req.body;
    const callback = Body?.stkCallback;
    if (!callback) return res.json({ ResultCode: 0 });

    const checkoutId = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode;

    if (resultCode === 0) {
      const items = callback.CallbackMetadata?.Item || [];
      const get = (name) => items.find(i => i.Name === name)?.Value;
      const amount = get('Amount');
      const mpesaCode = get('MpesaReceiptNumber');
      const phone = get('PhoneNumber')?.toString();

      const tx = await Transaction.findOneAndUpdate(
        { reference: checkoutId, status: 'pending' },
        { status: 'completed', mpesaCode, description: `M-Pesa deposit - ${mpesaCode}` },
        { new: true }
      );

      if (tx) {
        const user = await User.findById(tx.user);
        if (user) {
          tx.balanceBefore = user.balance;
          user.balance = parseFloat((user.balance + amount).toFixed(2));
          tx.balanceAfter = user.balance;
          tx.amount = amount;
          await user.save();
          await tx.save();
        }
      }
    } else {
      await Transaction.findOneAndUpdate(
        { reference: checkoutId, status: 'pending' },
        { status: 'failed', description: 'M-Pesa payment cancelled or failed' }
      );
    }
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (e) {
    console.error('Callback error:', e.message);
    res.json({ ResultCode: 0 });
  }
});

// Check deposit status (polling)
router.get('/status/:checkoutId', auth, async (req, res) => {
  try {
    const tx = await Transaction.findOne({ reference: req.params.checkoutId, user: req.user._id });
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ status: tx.status, amount: tx.amount, mpesaCode: tx.mpesaCode });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
