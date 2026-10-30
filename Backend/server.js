const express = require("express");
require("dotenv").config();

const cors = require("cors");
const connectDB = require("./src/config/db");

const authRout = require("./src/routers/authRoute");
const authMiddleware = require("./src/middleware/authMiddelware");
const roleMiddleware = require("./src/middleware/roleMiddleware");
const workerRoute = require("./src/routers/workersRoute");
const bookingRoute = require("./src/routers/bookingRoute");
const userRouts = require("./src/routers/userRouts");
const serviceRoute = require("./src/routers/serviceRoute");
const reviewRoute = require("./src/routers/reviewRoute");
const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRout);

app.get("/", (req, res) => {
  res.send("Worker Hiring API is running");
});

app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "you are authenticated",
    user: req.user
  });
});

app.get("/worker", authMiddleware, roleMiddleware("worker"), (req, res) => {
  res.json({ message: "welcome worker" });
});

app.use("/api/workers", workerRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/users", userRouts);
app.use("/api/services", serviceRoute);
app.use("/api/reviews", reviewRoute);

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});