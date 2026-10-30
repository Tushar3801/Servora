const services = require("../models/services");

const createService = async (req, res) => {
    try {
        const { name, category, description, basePrice, duration } = req.body;

        if (!name || !category) {
            return res.status(400).json({ message: "Name and category are required" });
        }

        const existingService = await services.findOne({ name, category, worker: null });

        if (existingService) {
            return res.status(409).json({ message: "Service already exists" });
        }

        const service = await services.create({ name, category, description, basePrice, duration });

        return res.status(201).json(service);
    } catch (err) {
        return res.status(500).json({ message: "Failed to create service" });
    }
};

const getAllServices = async (req, res) => {
    try {
        const data = await services.find({
            isActive: true,
            worker: { $ne: null }
        }).populate("worker", "name skill experience location availability");

        return res.status(200).json(data);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: err.message });
    }
};

const getServiceById = async (req, res) => {
    try {
        const service = await services.findById(req.params.id)
            .populate("worker", "name skill experience location hourlyRate availability");

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        return res.status(200).json(service);
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch service" });
    }
};

const updateService = async (req, res) => {
    try {
        const allowed = ["name", "category", "description", "basePrice", "duration", "isActive"];
        const updates = {};

        for (const field of allowed) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No valid fields provided" });
        }

        const service = await services.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        return res.status(200).json(service);
    } catch (err) {
        return res.status(500).json({ message: "Failed to update service" });
    }
};

const deleteService = async (req, res) => {
    try {
        const service = await services.findByIdAndDelete(req.params.id);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        return res.status(200).json({ message: "Service deleted" });
    } catch (err) {
        return res.status(500).json({ message: "Failed to delete service" });
    }
};

const deactivateService = async (req, res) => {
    try {
        const service = await services.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        return res.status(200).json({ message: "Service deactivated", service });
    } catch (err) {
        return res.status(500).json({ message: "Failed to deactivate service" });
    }
};

module.exports = { createService, getAllServices, getServiceById, updateService, deactivateService, deleteService };