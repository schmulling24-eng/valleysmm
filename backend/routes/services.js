const router = require('express').Router();
const Service = require('../models/Service');
const { auth, adminAuth } = require('../middleware/auth');

// Get all active services (public)
router.get('/', async (req, res) => {
  try {
    const { platform, category } = req.query;
    const filter = { isActive: true };
    if (platform) filter.platform = platform;
    if (category) filter.category = category;
    const services = await Service.find(filter).sort('category name');
    res.json(services);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const cats = await Service.distinct('category', { isActive: true });
    res.json(cats);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: Add service
router.post('/', adminAuth, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.json(service);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Admin: Update service
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(service);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Admin: Delete service
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Service.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Service deactivated' });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

module.exports = router;
