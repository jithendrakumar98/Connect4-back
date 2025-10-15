const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  players: { type: [String], required: true },
  board: { type: [[String]], required: true },
  winner: { type: String, default: null },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Game", gameSchema);
