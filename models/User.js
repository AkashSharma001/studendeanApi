const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  universityId: String,
  password: String,
  token: String,
  userType:String,
});

module.exports = mongoose.model('User', UserSchema);
