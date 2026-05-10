const express = require('express');
const MaintenanceTask = require('../models/MaintenanceTask');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET /api/maintenance  (filters: shipId, status, priority, overdue)
router.get('/', protect, async (req, res) => {
  try {
    const { shipId, status, priority, assignedTo } = req.query;
    const filter = {};
    if (shipId) filter.shipId = shipId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // If crew, only show tasks assigned to them
    if (req.user.role === 'crew') {
      filter.assignedTo = req.user._id;
    }

    const tasks = await MaintenanceTask.find(filter)
      .populate('shipId', 'name imoNumber')
      .populate('assignedTo', 'name email rank')
      .populate('notes.addedBy', 'name')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/maintenance/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await MaintenanceTask.findById(req.params.id)
      .populate('shipId', 'name imoNumber')
      .populate('assignedTo', 'name email rank')
      .populate('notes.addedBy', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/maintenance
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const task = await MaintenanceTask.create(req.body);
    const populated = await task.populate([
      { path: 'shipId', select: 'name imoNumber' },
      { path: 'assignedTo', select: 'name email rank' }
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/maintenance/:id  (update status, assignedTo, notes)
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await MaintenanceTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Crew can only update status and notes on their own tasks
    if (req.user.role === 'crew') {
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      if (req.body.status) task.status = req.body.status;
      if (req.body.status === 'Completed') task.completedAt = new Date();
    } else {
      // Admin can update anything
      const { title, description, shipId, assignedTo, status, priority, dueDate } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (shipId) task.shipId = shipId;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate) task.dueDate = dueDate;
      if (status === 'Completed' && !task.completedAt) task.completedAt = new Date();
    }

    // Add note if provided
    if (req.body.note) {
      task.notes.push({ text: req.body.note, addedBy: req.user._id });
    }

    await task.save();
    const updated = await MaintenanceTask.findById(task._id)
      .populate('shipId', 'name imoNumber')
      .populate('assignedTo', 'name email rank')
      .populate('notes.addedBy', 'name');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/maintenance/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const task = await MaintenanceTask.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
