const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semester: { type: String, required: true },
  subject: { type: String, required: true },
  grade: { type: String, required: true },
  credits: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Grade', GradeSchema);
