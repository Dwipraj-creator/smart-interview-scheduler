require("dotenv").config();
const startReminderJob = require("./jobs/reminder.job");
const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);

startReminderJob(io)
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-interviewer-room", (interviewerId) => {
    socket.join(interviewerId);
    console.log(`Interviewer joined room: ${interviewerId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});