const Player = require("../models/playerModel");

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Player.find().sort({ wins: -1 }).limit(10);
    res.status(200).json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getLeaderboard };
