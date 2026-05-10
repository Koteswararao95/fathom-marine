const express = require('express');
const SafetyDrill = require('../models/SafetyDrill');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET /api/drills  (filters: shipId, status, type)
router.get('/', protect, async (req, res) => {
  try {
    const { shipId, status, type } = req.query;
    const filter = {};
    if (shipId) filter.shipId = shipId;
    if (status) filter.status = status;
    if (type) filter.type = type;

    const drills = await SafetyDrill.find(filter)
      .populate('shipId', 'name imoNumber')
      .populate('participants.userId', 'name email rank')
      .sort({ scheduledDate: 1 });

    res.json(drills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/drills/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const drill = await SafetyDrill.findById(req.params.id)
      .populate('shipId', 'name imoNumber')
      .populate('participants.userId', 'name email rank');
    if (!drill) return res.status(404).json({ message: 'Drill not found' });
    res.json(drill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/drills
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const drill = await SafetyDrill.create(req.body);
    const populated = await SafetyDrill.findById(drill._id)
      .populate('shipId', 'name imoNumber')
      .populate('participants.userId', 'name email rank');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/drills/:id  (admin: update drill details)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const drill = await SafetyDrill.findById(req.params.id);
    if (!drill) return res.status(404).json({ message: 'Drill not found' });

    const { title, type, shipId, scheduledDate, status, notes, participants } = req.body;
    if (title) drill.title = title;
    if (type) drill.type = type;
    if (shipId) drill.shipId = shipId;
    if (scheduledDate) drill.scheduledDate = scheduledDate;
    if (status) drill.status = status;
    if (notes !== undefined) drill.notes = notes;
    if (status === 'Completed' && !drill.completedAt) drill.completedAt = new Date();
    if (participants) drill.participants = participants;

    await drill.save();
    const updated = await SafetyDrill.findById(drill._id)
      .populate('shipId', 'name imoNumber')
      .populate('participants.userId', 'name email rank');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/drills/:id/attend  (crew marks attendance)
router.put('/:id/attend', protect, async (req, res) => {
  try {
    const drill = await SafetyDrill.findById(req.params.id);
    if (!drill) return res.status(404).json({ message: 'Drill not found' });

    const existing = drill.participants.find(
      (p) => p.userId.toString() === req.user._id.toString()
    );

    if (existing) {
      existing.attended = true;
      existing.completedAt = new Date();
    } else {
      drill.participants.push({ userId: req.user._id, attended: true, completedAt: new Date() });
    }

    await drill.save();
    const updated = await SafetyDrill.findById(drill._id)
      .populate('shipId', 'name imoNumber')
      .populate('participants.userId', 'name email rank');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/drills/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const drill = await SafetyDrill.findByIdAndDelete(req.params.id);
    if (!drill) return res.status(404).json({ message: 'Drill not found' });
    res.json({ message: 'Drill removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
