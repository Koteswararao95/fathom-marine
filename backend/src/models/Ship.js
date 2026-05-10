const mongoose = require('mongoose');

const shipSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  imoNumber: { type: String, required: true, unique: true, trim: true },
  type: { type: String, required: true },
  flag: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Docked', 'Under Maintenance'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Ship', shipSchema);
