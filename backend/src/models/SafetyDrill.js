const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attended: { type: Boolean, default: false },
  completedAt: { type: Date, default: null }
});

const safetyDrillSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['Fire Drill', 'Evacuation Drill', 'Man Overboard', 'Oil Spill', 'Medical Emergency', 'Other'],
    required: true
  },
  shipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ship', required: true },
  scheduledDate: { type: Date, required: true },
  completedAt: { type: Date, default: null },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Missed'], default: 'Scheduled' },
  participants: [participantSchema],
  notes: { type: String, default: '' }
}, { timestamps: true });

// Virtual: isMissed
safetyDrillSchema.virtual('isMissed').get(function () {
  if (this.status === 'Completed') return false;
  return new Date() > this.scheduledDate;
});

safetyDrillSchema.set('toJSON', { virtuals: true });
safetyDrillSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SafetyDrill', safetyDrillSchema);
