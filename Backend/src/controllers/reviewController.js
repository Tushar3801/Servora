const Review = require("../models/reviews");
const Booking = require("../models/bookings");
const Worker = require("../models/workers");
const mongoose = require("mongoose");

const createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;

        if (!mongoose.isValidObjectId(bookingId) ||
            !Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Invalid booking or rating" });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.customer.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not your booking" });
        }

        if (booking.status !== "completed") {
            return res.status(400).json({ message: "Booking not completed" });
        }

        const exists = await Review.findOne({ booking: bookingId });

        if (exists) return res.status(409).json({ message: "Already reviewed" });

        const review = await Review.create({
            customer: req.user.id,
            worker: booking.worker,
            booking: bookingId,
            rating,
            comment
        });

        return res.status(201).json(review);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "Already reviewed" });
        }
        return res.status(500).json({ message: "Failed to create review" });
    }
};

const getWorkerReviews = async (req, res) => {
    try {
        const { workerId } = req.params;

        if (!mongoose.isValidObjectId(workerId)) {
            return res.status(400).json({ message: "Invalid worker ID" });
        }

        const worker = await Worker.findById(workerId);
        if (!worker) return res.status(404).json({ message: "Worker not found" });

        const reviews = await Review.find({ worker: workerId })
            .populate("customer", "name");

        const total = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const average = total ? Number((sum / total).toFixed(1)) : 0;

        return res.status(200).json({ total, average, reviews });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch reviews" });
    }
};

const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ customer: req.user.id })
            .populate("worker", "name skill");

        return res.status(200).json(reviews);
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch reviews" });
    }
};

const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        if (!mongoose.isValidObjectId(reviewId)) {
            return res.status(400).json({ message: "Invalid review ID" });
        }

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Review not found" });

        if (review.customer.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not your review" });
        }

        if (rating === undefined && comment === undefined) {
            return res.status(400).json({ message: "Nothing to update" });
        }

        if (rating !== undefined) {
            if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                return res.status(400).json({ message: "Rating must be 1-5" });
            }
            review.rating = rating;
        }

        if (comment !== undefined) {
            if (typeof comment !== "string") {
                return res.status(400).json({ message: "Invalid comment" });
            }
            review.comment = comment;
        }

        await review.save();
        return res.status(200).json(review);
    } catch (err) {
        return res.status(500).json({ message: "Failed to update review" });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!mongoose.isValidObjectId(reviewId)) {
            return res.status(400).json({ message: "Invalid review ID" });
        }

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Review not found" });

        if (review.customer.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not your review" });
        }

        await review.deleteOne();
        return res.status(200).json({ message: "Review deleted" });
    } catch (err) {
        return res.status(500).json({ message: "Failed to delete review" });
    }
};

module.exports = {
    createReview,
    getWorkerReviews,
    getMyReviews,
    updateReview,
    deleteReview
};