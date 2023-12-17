const mongoose = require('mongoose');

const startDate = new Date(2023, 10, 17, 10, 0, 0); // 10 corresponds to November (zero-based)
const startDateString = startDate.toLocaleString(); // Convert to local time string

const SessionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dean: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startDateAndTime: { type: String },
});
module.exports = mongoose.model('Session', SessionSchema);
