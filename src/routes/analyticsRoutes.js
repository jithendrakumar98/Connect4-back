const express = require("express");
const router = express.Router();
const Analytics = require("../models/analyticsModel");

const getAnalytics = async (req, res) => {
  try {
    const completedGames = await Analytics.find({ eventType: "game_completed" });

    const avgDuration = completedGames.length > 0
      ? completedGames.reduce((sum, game) => sum + (game.duration || 0), 0) / completedGames.length
      : 0;

    const now = new Date();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const gamesLastHour = await Analytics.countDocuments({
      eventType: "game_completed",
      timestamp: { $gte: oneHourAgo }
    });

    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const gamesToday = await Analytics.countDocuments({
      eventType: "game_completed",
      timestamp: { $gte: oneDayAgo }
    });

    const winnerStats = await Analytics.aggregate([
      { $match: { eventType: "game_completed", winner: { $ne: null, $ne: "draw" } } },
      { $group: { _id: "$winner", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      totalGames: completedGames.length,
      averageGameDuration: Math.round(avgDuration / 1000),
      gamesLastHour,
      gamesToday,
      topWinners: winnerStats.map(w => ({ player: w._id, wins: w.count }))
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

router.get("/", getAnalytics);

module.exports = router;