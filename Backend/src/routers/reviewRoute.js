const express = require("express");
const app = express.Router();
const reviewController = require("../controllers/reviewController");
const authMiddelware = require("../middleware/authMiddelware");
const roleMiddleware = require("../middleware/roleMiddleware");

app.post("/", authMiddelware, roleMiddleware("customer"), reviewController.createReview);
app.get("/my-reviews", authMiddelware, roleMiddleware("customer"), reviewController.getMyReviews);
app.get("/worker/:workerId", reviewController.getWorkerReviews);
app.put("/:reviewId", authMiddelware, roleMiddleware("customer"), reviewController.updateReview);
app.delete("/:reviewId", authMiddelware, roleMiddleware("customer"), reviewController.deleteReview);

module.exports = app;