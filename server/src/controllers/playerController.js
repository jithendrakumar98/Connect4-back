const Player = require("../models/playerModel");

const joinPlayer = async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: "Username required" });

  try {
    const player = await Player.findOne({ username });
    if (!player) {
      await Player.create({ username, wins: 0 });
    }
    res.status(200).json({ message: `${username} joined successfully` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getPlayers = async (req, res) => {
  try {
    const players = await Player.find().sort({ wins: -1 });
    res.status(200).json(players);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { joinPlayer, getPlayers };
