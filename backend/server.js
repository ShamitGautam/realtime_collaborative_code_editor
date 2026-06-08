import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { YSocketIO } from "y-socket.io/dist/server";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const ysocketio = new YSocketIO(io);

ysocketio.initialize();

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "YJS Server Running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Healthy",
  });
});

const PORT = 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});