const express = require('express');
const Ship = require('../models/Ship');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET /api/ships
router.get('/', protect, async (req, res) => {
  try {
    const ships = await Ship.find().sort({ createdAt: -1 });
    res.json(ships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/ships/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const ship = await Ship.findById(req.params.id);
    if (!ship) return res.status(404).json({ message: 'Ship not found' });
    res.json(ship);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ships
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const ship = await Ship.create(req.body);
    res.status(201).json(ship);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/ships/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const ship = await Ship.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ship) return res.status(404).json({ message: 'Ship not found' });
    res.json(ship);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/ships/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const ship = await Ship.findByIdAndDelete(req.params.id);
    if (!ship) return res.status(404).json({ message: 'Ship not found' });
    res.json({ message: 'Ship removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
