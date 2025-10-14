const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "connect4-backend",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"]
});

const producer = kafka.producer();

const connectProducer = async () => {
  await producer.connect();
  console.log("✅ Kafka producer connected");
};

const sendGameEvent = async (event) => {
  try {
    await producer.send({
      topic: "game-events",
      messages: [{ value: JSON.stringify(event) }]
    });
  } catch (err) {
    console.error("Kafka producer error:", err);
  }
};

module.exports = { connectProducer, sendGameEvent };
