const mongoose = require("mongoose");

const validateBooking = (req, res, next) => {
    const { worker, serviceId, serviceDate, serviceTime, address } = req.body;

    if (!worker || !serviceId || !serviceDate || !serviceTime || !address) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.isValidObjectId(worker) || !mongoose.isValidObjectId(serviceId)) {
        return res.status(400).json({ message: "Invalid worker or service ID" });
    }

    if (typeof serviceDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(serviceDate) ||
        !Number.isFinite(Date.parse(serviceDate)) ||
        new Date(serviceDate).toISOString().slice(0, 10) !== serviceDate) {
        return res.status(400).json({ message: "Invalid date" });
    }

    if (serviceDate < new Date().toISOString().slice(0, 10)) {
        return res.status(400).json({ message: "Cannot book a past date" });
    }

    if (typeof serviceTime !== "string" ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(serviceTime)) {
        return res.status(400).json({ message: "Invalid time" });
    }

    if (typeof address !== "string" || !address.trim()) {
        return res.status(400).json({ message: "Invalid address" });
    }

    next();
};

module.exports = validateBooking;