const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  eventType: String,
  roomId: String,
  players: [String],
  winner: String,
  duration: Number,
  timestamp: Date,
  data: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model("Analytics", analyticsSchema);