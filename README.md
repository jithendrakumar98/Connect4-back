# Connect 4 Backend Server

[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.x-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

A real-time multiplayer backend server for Connect 4, built with Node.js, Express, Socket.IO, and MongoDB. Features live game synchronization, player management, leaderboard tracking, and optional Kafka integration for event streaming.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Kafka Integration](#kafka-integration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Real-time Gameplay** — Socket.IO-powered bidirectional communication
- **Room Management** — Automatic player matching and room creation
- **Turn-based Logic** — Server-side validation and game state management
- **Persistent Storage** — MongoDB integration for player data and game history
- **Leaderboard System** — Track wins, losses, and player rankings
- **Event Streaming** — Optional Kafka integration for analytics and logging
- **Production Ready** — Optimized for deployment on cloud platforms

---

## Architecture

```
connect4-backend/
├── src/
│   ├── kafka/
│   │   └── producer.js          # Kafka event producer
│   │   └── consumer.js          # Kafka event consumer
│   ├── controllers/
│   │   └── leaderboardController.js          # Leaderboard controller
│   │   └── playerController.js               # Player Controller
│   ├── models/
│   │   └── gameModel.js         # MongoDB Gmae schema
│   │   └── analyticsModel.js    # MongoDB analytics schema
│   │   └── playerModel.js       # MongoDB player schema
│   ├── routes/
│   │   └── leaderboard.js       # Leaderboard API routes
│   │   └── analyticsRoutes.js   # analyticsRoutes API routes
│   │   └── playerRoutes.js      # playerRoutes API routes
│   ├── config/
│   │   └── db.js                # Database connection
│   └── sockets/
│   │     └── gameSocket.js        # Socket.IO
│   └── utils/
│   │    └── gameLogic.js          #  game logic
│   └── services/
│       └── botService.js          # Bot logic
│       └── gameService.js         # Game service
│       └── matchmakingService.js  # MatchMaking
├── .env                         # Environment template
├── docker-compose.yml           # Kafka local setup
├── index.js                     # Server entry point
├── package.json                 # Dependencies
└── README.md                    # Documentation
```

---

## Prerequisites

Ensure you have the following installed:

- **Node.js** (v16 or higher) — [Download](https://nodejs.org/)
- **npm** or **yarn** — Package manager
- **MongoDB** — Local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Docker** (optional) — For local Kafka setup

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/jithendrakumar98/connect4.git
cd connect4
```

### 2. Install Dependencies

**Option A: Using npm**
```bash
npm install
```

**Option B: Using backend-requirements.txt**

*Linux/macOS:*
```bash
xargs npm install < backend-requirements.txt
```

*Windows PowerShell:*
```powershell
Get-Content backend-requirements.txt | ForEach-Object { npm install $_ }
```

### 3. Required Packages

The following packages will be installed:

- `express` — Web framework
- `socket.io` — Real-time communication
- `mongoose` — MongoDB ODM
- `dotenv` — Environment variable management
- `cors` — Cross-origin resource sharing
- `kafkajs` — Kafka client (optional)
- `nodemon` — Development auto-reload

---

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
touch .env
```

Add the following configuration:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/connect4?retryWrites=true&w=majority

# Kafka (Optional - uncomment when ready)
# KAFKA_BROKER=localhost:9092
# KAFKA_CLIENT_ID=connect4-backend
```

**Security Note:** Never commit your `.env` file. Add it to `.gitignore`.

---

## Running the Server

### Development Mode

Automatically restarts on file changes:

```bash
npm run dev
# or
npx nodemon index.js
```

### Production Mode

```bash
npm start
# or
node index.js
```

### Verify Server is Running

The console should display:

```
🚀 Server running on port 4000
✅ Connected to MongoDB
```

Visit `http://localhost:4000` to see the health check response:

```json
{
  "status": "online",
  "message": "Connect 4 backend running..."
}
```

---

## Deployment

### Deploying to Render

[Render](https://render.com/) offers free hosting for Node.js applications.

#### Configuration

1. **Create New Web Service** on Render
2. **Connect GitHub Repository**
3. **Configure Build Settings:**

| Setting | Value |
|---------|-------|
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |
| **Environment** | Node |

4. **Add Environment Variables:**
   - `PORT` — Auto-assigned by Render
   - `MONGO_URI` — Your MongoDB connection string
   - `NODE_ENV` — `production`

5. **Deploy**

#### Important: Kafka on Render

Kafka requires a separate hosting service and is **commented out by default**. To enable:

1. Set up Kafka on a service like [CloudKarafka](https://www.cloudkarafka.com/) or [Confluent Cloud](https://www.confluent.io/confluent-cloud/)
2. Uncomment Kafka code in `index.js` and `src/sockets/gameSocket.js`
3. Add `KAFKA_BROKER` to environment variables

---

## API Reference

### HTTP Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/` | Health check | `{ status: "online", message: "..." }` |
| `GET` | `/api/leaderboard` | Fetch top players | `[{ name, wins, losses, gamesPlayed }]` |
| `POST` | `/api/player` | Create/update player | `{ success: true, player: {...} }` |

### Socket.IO Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `joinRoom` | `{ roomId, playerName }` | Join or create game room |
| `makeMove` | `{ roomId, column, playerId }` | Drop piece in column |
| `disconnect` | — | Handle player disconnect |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `roomJoined` | `{ roomId, players, board }` | Confirmation of room join |
| `gameStart` | `{ currentPlayer }` | Both players ready |
| `moveMade` | `{ board, nextPlayer }` | Move validated |
| `gameOver` | `{ winner, board }` | Game completed |
| `error` | `{ message }` | Error notification |

---

## Kafka Integration

Kafka is used for event streaming and analytics (optional feature).

### Local Setup with Docker

#### 1. Start Kafka Services

Ensure Docker is running, then execute:

```bash
docker-compose up -d
```

This starts:
- **Zookeeper** on `localhost:2181`
- **Kafka** on `localhost:9092`

#### 2. Verify Containers

```bash
docker ps
```

You should see both `zookeeper` and `kafka` containers running.

#### 3. Enable Kafka in Code

**In `index.js`:**
```javascript
// Uncomment these lines:
const { connectProducer } = require("./src/kafka/producer");
connectProducer();
```

**In `src/sockets/gameSocket.js`:**
```javascript
// Uncomment Kafka event publishing logic
```

#### 4. Restart Server

```bash
npm run dev
```

### Kafka Events

The following game events are published:

- `game.started` — New game begins
- `move.made` — Player makes a move
- `game.ended` — Game concludes with winner

---

## Troubleshooting

### Common Issues

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| **Port already in use** | Another process on port 4000 | Change `PORT` in `.env` or kill process: `lsof -ti:4000 \| xargs kill -9` |
| **MongoDB connection failed** | Invalid URI or network issue | Verify `MONGO_URI` format and network access |
| **Socket.IO connection refused** | Frontend pointing to wrong URL | Update frontend `.env` with correct backend URL |
| **Kafka connection error** | Kafka not running | Start Docker Compose or comment out Kafka code |
| **CORS errors** | Origin not whitelisted | Update CORS configuration in `index.js` |

### Debug Mode

Enable verbose logging:

```bash
DEBUG=socket.io* node index.js
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Test thoroughly before submitting
- Update documentation as needed

---

## Credits

**Developed by** [Jithendra Kumar Arthimalla](https://github.com/jithendrakumar98)

Built with ❤️ using Node.js, Express, Socket.IO, and MongoDB.

---

## Support

For issues and questions:
- **GitHub Issues:** [Create an issue](https://github.com/jithendrakumar98/connect4/issues)
- **Email:** [Contact developer](mailto:2200030165cseh@gmail.com)

---

**[⬆ Back to Top](#connect-4-backend-server)**
