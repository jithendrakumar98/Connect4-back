const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "connect4-analytics",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"]
});

const consumer = kafka.consumer({ groupId: "analytics-group" });

const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "game-events", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      console.log("📊 Kafka Event:", event);
    }
  });

  console.log("✅ Kafka consumer running");
};

module.exports = { startConsumer };
