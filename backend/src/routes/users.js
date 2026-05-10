const express = require('express');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET /api/users  (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { role, shipId } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (shipId) filter.shipId = shipId;
    const users = await User.find(filter).select('-password').populate('shipId', 'name imoNumber');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('shipId', 'name imoNumber');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/:id  (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, role, shipId, rank } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, shipId, rank },
      { new: true, runValidators: true }
    ).select('-password').populate('shipId', 'name imoNumber');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/users/:id  (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
