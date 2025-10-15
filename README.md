# 🎮 Connect 4 — Backend Server (Express + Socket.IO)

> ⚡ Real-time backend for the **Connect 4 Multiplayer Game** built using **Node.js**, **Express**, **Socket.IO**, and **MongoDB**.  
> Includes optional **Kafka integration** for event streaming — commented out for Render hosting.

---

## 🧩 Overview

This backend powers a real-time Connect 4 game, allowing two players to compete in the same room with automatic turn switching, leaderboard tracking, and persistent data storage.

---

## 🚀 Quick Start (Local Setup)

### 1️⃣ Clone the Repository

---
git clone https://github.com/<your-username>/connect4.git
cd connect4

2️⃣ Install Dependencies

You can install all required packages in one go using the backend-requirements.txt file.

💻 For Linux / macOS:
xargs npm install < backend-requirements.txt

💻 For Windows PowerShell:
Get-Content backend-requirements.txt | ForEach-Object { npm install $_ }   OR npm install

3️⃣ Setup Environment Variables

Create a .env file in your backend folder:

touch .env


Add your configurations:

PORT=4000
MONGO_URI=mongodb+srv://<your-mongo-uri>
# Uncomment Kafka if using it
# KAFKA_BROKER=localhost:9092


⚠️ When deploying on Render, keep Kafka lines commented, since Kafka requires a separate paid hosting service.

4️⃣ Start the Server
🧠 Development Mode:
npx nodemon server.js

🚀 Production Mode:
node server.js


When the server starts successfully, you’ll see:

🚀 Server running on port 4000


You can now visit:
👉 http://localhost:4000

☁️ Render Deployment Guide

Render is a great free hosting option for this backend.

🔹 Build Command:
npm install

🔹 Start Command:
node server.js

⚠️ Important Note:

Kafka is commented out in:

index.js (or server.js)

src/sockets/gameSocket.js

You can uncomment these lines once you have a Kafka service running externally.

Example (in index.js):

// const { connectProducer } = require("./src/kafka/producer");
// connectProducer();


Uncomment when ready:

const { connectProducer } = require("./src/kafka/producer");
connectProducer();

🧰 API Overview
Method	Endpoint	Description
GET	/	Health check endpoint
GET	/api/leaderboard	Fetch leaderboard data
POST	/api/player	Add or update player info
Socket.IO	joinRoom	Player joins a game room
Socket.IO	makeMove	Player makes a move
🧱 Optional: Enable Kafka (Local Setup)

Kafka integration is used for event tracking and analytics.
You can run it locally with Docker.

1️⃣ find docker-compose.yml

In your backend folder, find a file named docker-compose.yml:

2️⃣ Start Kafka Services
#docker-compose up -d


You’ll see both zookeeper and kafka containers running:

#docker ps

3️⃣ Uncomment Kafka Code

In both files below, uncomment all Kafka-related lines:

server.js (or index.js)

src/sockets/gameSocket.js

Then restart your backend:

npm run dev


✅ Kafka will now listen on localhost:9092.

🔍 Verify Backend
1️⃣ Health Check

Visit:

http://localhost:4000


Response:

Connect 4 backend running...

2️⃣ API Check

Use Postman or browser to test:

GET http://localhost:4000/api/leaderboard

🧠 Troubleshooting
Issue	Cause	Solution
PORT already in use	Another process using port	Change PORT in .env
MongoDB connection error	Invalid URI	Check MONGO_URI format
Socket.IO connection refused	Wrong frontend backend URL	Update frontend .env
Kafka connection refused	Kafka not running	Start Docker or comment Kafka lines
🧾 backend-requirements.txt (Reference)

If you lose it, here’s the content to recreate it:

express
socket.io
mongoose
dotenv
cors
kafkajs
nodemon

🧩 Example Commands Summary
# Clone repo
git clone https://github.com/<your-username>/connect4.git
cd connect4/backend

# Install dependencies
xargs npm install < backend-requirements.txt

# Create environment file
touch .env

# Run locally
node server.js

# OR (auto restart for dev)
npx nodemon server.js

# Start Kafka services
docker-compose up -d

# Deploy on Render
npm install
node server.js

🧡 Credits

Developed by Jithendra Kumar
Real-time backend system for the Connect 4 Multiplayer Game
Built with ❤️ using Node.js, Express, Socket.IO, and MongoDB

💡 Notes

🟢 Kafka integration is optional — commented for Render free-tier support.
🟢 Uncomment the Kafka lines in index.js and gameSocket.js only when a Kafka broker is available.
🟢 Recommended to use Docker locally for full functionality.

