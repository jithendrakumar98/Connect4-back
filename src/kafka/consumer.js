const { Kafka } = require("kafkajs");
const Analytics = require("../models/analyticsModel");

const kafka = new Kafka({
  clientId: "connect4-analytics",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"]
});

const consumer = kafka.consumer({ groupId: "analytics-group" });

const startConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "game-events", fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          console.log("📊 Kafka Event:", event);

          await Analytics.create({
            eventType: event.type,
            roomId: event.roomId,
            players: event.players || [],
            winner: event.winner || null,
            duration: event.duration || null,
            timestamp: new Date(event.timestamp),
            data: event
          });

          if (event.type === "game_completed") {
            await calculateMetrics();
          }
        } catch (err) {
          console.error("Error processing Kafka message:", err);
        }
      }
    });

    console.log("✅ Kafka consumer running");
  } catch (err) {
    console.error("❌ Kafka consumer error:", err);
  }
};

async function calculateMetrics() {
  try {
    const completedGames = await Analytics.find({ eventType: "game_completed" });

    if (completedGames.length > 0) {
      const avgDuration = completedGames.reduce((sum, game) => sum + (game.duration || 0), 0) / completedGames.length;
      console.log(`📈 Average Game Duration: ${(avgDuration / 1000).toFixed(2)} seconds`);
    }

    const now = new Date();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const gamesLastHour = await Analytics.countDocuments({
      eventType: "game_completed",
      timestamp: { $gte: oneHourAgo }
    });
    console.log(`📈 Games in Last Hour: ${gamesLastHour}`);

    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const gamesToday = await Analytics.countDocuments({
      eventType: "game_completed",
      timestamp: { $gte: oneDayAgo }
    });
    console.log(`📈 Games Today: ${gamesToday}`);

    const winnerStats = await Analytics.aggregate([
      { $match: { eventType: "game_completed", winner: { $ne: null, $ne: "draw" } } },
      { $group: { _id: "$winner", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    console.log("📈 Top Winners:", winnerStats);
  } catch (err) {
    console.error("Error calculating metrics:", err);
  }
}

module.exports = { startConsumer };