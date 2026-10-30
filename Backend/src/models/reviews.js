const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "workers", required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "bookings", required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 }
}, { timestamps: true });

module.exports = mongoose.model("reviews", reviewSchema);