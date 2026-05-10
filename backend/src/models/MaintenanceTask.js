const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: String,
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedAt: { type: Date, default: Date.now }
});

const maintenanceTaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  shipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ship', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate: { type: Date, required: true },
  completedAt: { type: Date, default: null },
  notes: [noteSchema]
}, { timestamps: true });

// Virtual: isOverdue
maintenanceTaskSchema.virtual('isOverdue').get(function () {
  if (this.status === 'Completed') return false;
  return new Date() > this.dueDate;
});

maintenanceTaskSchema.set('toJSON', { virtuals: true });
maintenanceTaskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MaintenanceTask', maintenanceTaskSchema);
