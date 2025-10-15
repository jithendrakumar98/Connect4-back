const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const registerGameSocket = require("./src/sockets/gameSocket");
const leaderboardRoutes = require("./src/routes/leaderboardRoutes");
const playerRoutes = require("./src/routes/playerRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
// const { connectProducer } = require("./src/kafka/producer");
// const { startConsumer } = require("./src/kafka/consumer");

dotenv.config();

const initializeApp = async () => {
  try {
    await connectDB();
    // await connectProducer();
    // await startConsumer();
    //console.log("✅ All services initialized (Kafka disabled)");
  } catch (err) {
    console.error("❌ Initialization error:", err);
    process.exit(1);
  }
};

initializeApp();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Connect 4 backend running..."));
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/player", playerRoutes);
app.use("/api/analytics", analyticsRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

registerGameSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
