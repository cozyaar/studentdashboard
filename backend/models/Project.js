const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectName: { type: String, required: true },
  description: { type: String },
  techStack: [String],
  githubLink: { type: String },
  status: { type: String, enum: ['Completed', 'In Progress', 'Planned'], default: 'In Progress' },
  startDate: { type: Date },
  endDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
