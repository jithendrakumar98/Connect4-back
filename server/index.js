const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const registerGameSocket = require("./src/sockets/gameSocket");
const leaderboardRoutes = require("./src/routes/leaderboardRoutes");
const playerRoutes = require("./src/routes/playerRoutes");
const { connectProducer } = require("./src/kafka/producer");

dotenv.config();
connectProducer();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Connect 4 backend running..."));
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/player", playerRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Pass the Socket.IO server to your gameSocket module
registerGameSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
