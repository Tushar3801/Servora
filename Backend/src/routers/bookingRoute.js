const express = require("express");
const app = express.Router();

const bookingController = require("../controllers/bookingController");
const authMiddelware = require("../middleware/authMiddelware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validateBooking = require("../middleware/validateBooking");

app.post("/", authMiddelware, roleMiddleware("customer"), validateBooking, bookingController.createBooking);

app.get("/my-bookings", authMiddelware, roleMiddleware("customer"), bookingController.getMyBooking);

app.get("/worker-bookings", authMiddelware, roleMiddleware("worker"), bookingController.getWorkerBookings);

app.patch("/:id/status", authMiddelware, roleMiddleware("worker"), bookingController.updateBookingStatus);

app.patch("/:id/complete", authMiddelware, roleMiddleware("worker"), bookingController.completeBooking);

app.patch("/:id/cancel", authMiddelware, roleMiddleware("customer"), bookingController.cancelBooking);

module.exports = app;