const mongoose = require('mongoose');

const CertificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseName: { type: String, required: true },
  platform: { type: String },
  completionDate: { type: Date },
  certificateLink: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Certification', CertificationSchema);
