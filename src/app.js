const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const interviewerRoutes = require("./routes/interviewer.routes");
const availabilityRoutes = require("./routes/availability.routes");
const publicRoutes = require("./routes/public.routes");
const authRoutes = require("./routes/auth.routes");
const notificationRoutes = require("./routes/notification.routes");
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "Smart Interview Scheduler API is running",
  });
});

app.use("/api/interviewers", interviewerRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);


module.exports = app;