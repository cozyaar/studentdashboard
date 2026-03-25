const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillName: { type: String, required: true },
  level: { type: Number, min: 1, max: 10, default: 5 },
}, { timestamps: true });

module.exports = mongoose.model('Skill', SkillSchema);
