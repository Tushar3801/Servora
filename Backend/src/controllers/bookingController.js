const mongoose = require("mongoose");
const workers = require("../models/workers");
const bookings = require("../models/bookings");
const Service = require("../models/services");

const createBooking = async (req, res) => {
    try {
        const { worker, serviceId, serviceDate, serviceTime, address, description } = req.body;

        if (!worker || !serviceId || !serviceDate || !serviceTime || !address) {
            return res.status(400).json({ message: "Please provide all required information" });
        }

        if (!mongoose.isValidObjectId(worker) || !mongoose.isValidObjectId(serviceId)) {
            return res.status(400).json({ message: "Invalid worker or service ID" });
        }

        const selectWorker = await workers.findById(worker);

        if (!selectWorker) {
            return res.status(404).json({ message: "Worker not found" });
        }

        if (!selectWorker.availability) {
            return res.status(400).json({ message: "Worker is currently unavailable" });
        }

        const selectedService = await Service.findById(serviceId);

        if (!selectedService) {
            return res.status(404).json({ message: "Service not found" });
        }

        if (!selectedService.isActive) {
            return res.status(400).json({ message: "This service is currently unavailable" });
        }

        const workerOffersService = selectWorker.services.some(
            id => id.toString() === serviceId
        );

        if (!workerOffersService) {
            return res.status(400).json({ message: "This worker does not offer the selected service" });
        }

        if (String(selectedService.worker) !== String(selectWorker._id)) {
            return res.status(400).json({ message: "This service does not belong to the selected worker" });
        }

        if (!Number.isFinite(selectedService.basePrice) || selectedService.basePrice < 0) {
            return res.status(400).json({ message: "Invalid service price" });
        }

        const bookingDate = new Date(serviceDate);

        if (isNaN(bookingDate.getTime())) {
            return res.status(400).json({ message: "Invalid service date" });
        }

        const existingBooking = await bookings.findOne({
            worker: selectWorker._id,
            serviceDate: bookingDate,
            serviceTime,
            status: { $in: ["pending", "accepted"] }
        });

        if (existingBooking) {
            return res.status(409).json({ message: "Worker is already booked for this time slot" });
        }

        const newBooking = await bookings.create({
            customer: req.user.id,
            worker: selectWorker._id,
            service: selectedService._id,
            serviceDate: bookingDate,
            serviceTime,
            address,
            description,
            totalPrice: selectedService.basePrice,
            status: "pending"
        });

        return res.status(201).json({
            message: "Booking created successfully",
            booking: newBooking
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "Worker is already booked for this time slot" });
        }

        return res.status(500).json({ message: "Failed to create booking" });
    }
};

const getMyBooking = async (req, res) => {
    try {
        const myBooking = await bookings.find({ customer: req.user.id })
            .populate("worker", "name skill hourlyRate")
            .populate("service", "name category basePrice duration");

        return res.status(200).json(myBooking);
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch bookings" });
    }
};

const getWorkerBookings = async (req, res) => {
    try {
        const workerProfile = await workers.findOne({ user: req.user.id });

        if (!workerProfile) {
            return res.status(404).json({ message: "Worker profile not found" });
        }

        const workerBookings = await bookings.find({ worker: workerProfile._id })
            .populate("customer", "name phone")
            .populate("service", "name category basePrice duration");

        return res.status(200).json(workerBookings);
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch worker bookings" });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { status } = req.body;

        if (!mongoose.isValidObjectId(bookingId)) {
            return res.status(400).json({ message: "Invalid booking ID" });
        }

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid booking status" });
        }

        const workerProfile = await workers.findOne({ user: req.user.id });

        if (!workerProfile) {
            return res.status(404).json({ message: "Worker profile not found" });
        }

        const booking = await bookings.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.worker.toString() !== workerProfile._id.toString()) {
            return res.status(403).json({ message: "Not authorized for this booking" });
        }

        if (booking.status !== "pending") {
            return res.status(409).json({ message: "Booking already processed" });
        }

        booking.status = status;
        await booking.save();

        return res.status(200).json({
            message: "Booking status updated successfully",
            booking
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to update booking status" });
    }
};

const completeBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;

        if (!mongoose.isValidObjectId(bookingId)) {
            return res.status(400).json({ message: "Invalid booking ID" });
        }

        const workerProfile = await workers.findOne({ user: req.user.id });

        if (!workerProfile) {
            return res.status(404).json({ message: "Worker profile not found" });
        }

        const booking = await bookings.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.worker.toString() !== workerProfile._id.toString()) {
            return res.status(403).json({ message: "Not authorized for this booking" });
        }

        if (booking.status !== "accepted") {
            return res.status(409).json({ message: "Only accepted bookings can be completed" });
        }

        booking.status = "completed";
        await booking.save();

        return res.status(200).json({
            message: "Booking completed successfully",
            booking
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to complete booking" });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;

        if (!mongoose.isValidObjectId(bookingId)) {
            return res.status(400).json({ message: "Invalid booking ID" });
        }

        const booking = await bookings.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.customer.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to cancel this booking" });
        }

        if (!["pending", "accepted"].includes(booking.status)) {
            return res.status(409).json({ message: "Booking cannot be cancelled" });
        }

        booking.status = "cancelled";
        await booking.save();

        return res.status(200).json({
            message: "Booking cancelled successfully",
            booking
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to cancel booking" });
    }
};

module.exports = {
    createBooking,
    getMyBooking,
    getWorkerBookings,
    updateBookingStatus,
    completeBooking,
    cancelBooking
};