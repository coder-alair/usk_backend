require('./config/database').dbConnection();
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const socketIo = require("socket.io");
const morgan = require("morgan");
const I18n = require('./i18n/i18n');
const router = require("./routes/index");

// Initializing app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*" // Update as needed for security
  }
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Joining rooms based on role
  socket.on("joinRoom", ({ userId, role }) => {
    const room = role === "driver" ? `driver_${userId}` : `rider_${userId}`;
    socket.join(room);
    console.log(`${socket.id} joined room: ${room}`);
  });

  // Receiving and broadcasting location updates
  socket.on("locationUpdate", ({ userId, role, location }) => {
    const room = role === "driver" ? `rider_${userId}` : `driver_${userId}`;
    io.to(room).emit("locationUpdate", { userId, location });

    console.log(`Location update from ${role}:`, location);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

module.exports = { io };
// Export io for use in other files

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.set('trust proxy', true);
app.use(I18n);
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Initialize router here
app.use('/', router);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
//   next();
// });

// Starting server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});

