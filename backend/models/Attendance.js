const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  room: { type: String, required: true },
  slot: { type: String },
  faculty: { type: String },
  time: { type: String },
  credits: { type: Number, default: 3.0 },
  courseCode: { type: String },
  days: [{ type: String }], // ['MON', 'WED', 'FRI']
  history: [{
    date: { type: String }, // Format: YYYY-MM-DD
    status: { type: String, enum: ['Present', 'Absent', 'Ignored', 'On Duty'], default: 'Present' }
  }],
  attendedClasses: { type: Number, default: 0 },
  totalClasses: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
