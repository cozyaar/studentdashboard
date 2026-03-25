const mongoose = require('mongoose');

const HackathonSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  organizer: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  role: { type: String, enum: ['Participant', 'Finalist', 'Winner'], default: 'Participant' },
  teamSize: { type: Number, default: 1 },
  description: { type: String },
  skills: [String],
  certificateUrl: { type: String },
  certificateType: { type: String } // 'image', 'pdf', etc
}, { timestamps: true });

module.exports = mongoose.model('Hackathon', HackathonSchema);
