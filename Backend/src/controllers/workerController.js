const mongoose = require("mongoose");
const workers = require("../models/workers");
const Service = require("../models/services");

const registerWorker = async (req, res) => {
    try {
        const { name, skill, experience, location, hourlyRate, availability, description } = req.body;

        const duplicateWorker = await workers.findOne({ user: req.user.id });

        if (duplicateWorker) {
            return res.status(409).json({ message: "Worker already exists" });
        }

        const worker = await workers.create({
            user: req.user.id,
            name,
            skill,
            experience,
            location,
            hourlyRate,
            availability,
            description
        });

        return res.status(201).json(worker);
    } catch (err) {
        return res.status(500).json({ message: "Worker registration failed" });
    }
};

const getWorkerProfile = async (req, res) => {
    try {
        const worker = await workers
            .findOne({ user: req.user.id })
            .populate("services");

        if (!worker) {
            return res.status(404).json({ message: "Worker profile not found" });
        }

        worker.services = worker.services.filter(
            service => service && String(service.worker) === String(worker._id)
        );

        return res.status(200).json(worker);
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch worker profile" });
    }
};

const updateWorker = async (req, res) => {
    try {
        const allowedFields = [
            "name",
            "skill",
            "experience",
            "location",
            "hourlyRate",
            "availability",
            "description"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No valid fields provided" });
        }

        const worker = await workers.findOneAndUpdate(
            { user: req.user.id },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }

        return res.status(200).json(worker);
    } catch (err) {
        return res.status(500).json({ message: "Failed to update worker" });
    }
};

const deleteWorker = async (req, res) => {
    try {
        const worker = await workers.findOneAndDelete({ user: req.user.id });

        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }

        await Service.updateMany(
            { worker: worker._id },
            { $set: { isActive: false } }
        );

        return res.status(200).json({ message: "Worker deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Failed to delete worker" });
    }
};

const allWorker = async (req, res) => {
    try {
        const {
            skill,
            location,
            minExperience,
            maxExperience,
            maxRate,
            availability,
            minRate,
            sort
        } = req.query;

        const filter = {};

        if (skill) filter.skill = skill;
        if (location) filter.location = location;

        if (minExperience || maxExperience) {
            filter.experience = {};
            if (minExperience) filter.experience.$gte = Number(minExperience);
            if (maxExperience) filter.experience.$lte = Number(maxExperience);
        }

        if (availability !== undefined) {
            filter.availability = availability === "true";
        }

        if (minRate || maxRate) {
            filter.hourlyRate = {};
            if (minRate) filter.hourlyRate.$gte = Number(minRate);
            if (maxRate) filter.hourlyRate.$lte = Number(maxRate);
        }

        let query = workers.find(filter);

        if (sort === "priceAsc") query = query.sort({ hourlyRate: 1 });
        if (sort === "priceDes") query = query.sort({ hourlyRate: -1 });

        const worker = await query;

        return res.status(200).json(worker);
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch workers" });
    }
};

const getWorkerById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid worker ID" });
        }

        const worker = await workers
            .findById(req.params.id)
            .populate("services");

        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }

        worker.services = worker.services.filter(
            service =>
                service &&
                service.isActive &&
                String(service.worker) === String(worker._id)
        );

        return res.status(200).json(worker);
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch worker" });
    }
};

const addWorkerService = async (req, res) => {
    try {
        const { serviceId } = req.body;

        if (!mongoose.isValidObjectId(serviceId)) {
            return res.status(400).json({ message: "Invalid service ID" });
        }

        const worker = await workers.findOne({ user: req.user.id });

        if (!worker) {
            return res.status(404).json({ message: "Worker profile not found" });
        }

        const service = await Service.findOne({
            _id: serviceId,
            worker: worker._id
        });

        if (!service) {
            return res.status(404).json({ message: "Service not found or not owned by you" });
        }

        if (worker.services.some(id => String(id) === String(serviceId))) {
            return res.status(409).json({ message: "Service already added" });
        }

        worker.services.push(serviceId);
        await worker.save();

        return res.status(200).json({
            message: "Service added successfully",
            worker
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to add service" });
    }
};

const removeWorkerService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!mongoose.isValidObjectId(serviceId)) {
            return res.status(400).json({ message: "Invalid service ID" });
        }

        const worker = await workers.findOne({ user: req.user.id });

        if (!worker) {
            return res.status(404).json({ message: "Worker profile not found" });
        }

        const service = await Service.findOne({
            _id: serviceId,
            worker: worker._id
        });

        if (!service) {
            return res.status(404).json({ message: "Service not found or not owned by you" });
        }

        worker.services.pull(serviceId);
        await worker.save();

        service.isActive = false;
        await service.save();

        return res.status(200).json({
            message: "Service removed successfully"
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to remove service" });
    }
};

const updateWorkerService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!mongoose.isValidObjectId(serviceId)) {
            return res.status(400).json({ message: "Invalid service ID" });
        }

        const worker = await workers.findOne({ user: req.user.id });

        if (!worker) {
            return res.status(404).json({ message: "Worker profile not found" });
        }

        const service = await Service.findOne({
            _id: serviceId,
            worker: worker._id,
            _id: { $in: worker.services }
        });

        if (!service) {
            return res.status(404).json({ message: "Service not found in your profile" });
        }

        const allowedFields = [
            "name",
            "category",
            "description",
            "basePrice",
            "duration"
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                service[field] = req.body[field];
            }
        }

        if (!service.name?.trim() || !service.category?.trim()) {
            return res.status(400).json({ message: "Name and category are required" });
        }

        if (
            !Number.isFinite(Number(service.basePrice)) ||
            !Number.isFinite(Number(service.duration)) ||
            Number(service.basePrice) <= 0 ||
            Number(service.duration) <= 0
        ) {
            return res.status(400).json({ message: "Enter a valid price and duration" });
        }

        await service.save();

        return res.status(200).json({
            message: "Service updated successfully",
            service
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to update service" });
    }
};

const toggleWorkerService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!mongoose.isValidObjectId(serviceId)) {
            return res.status(400).json({ message: "Invalid service ID" });
        }

        const worker = await workers.findOne({ user: req.user.id });

        if (!worker) {
            return res.status(404).json({ message: "Worker profile not found" });
        }

        const service = await Service.findOne({
            _id: serviceId,
            worker: worker._id,
            _id: { $in: worker.services }
        });

        if (!service) {
            return res.status(404).json({ message: "Service not found in your profile" });
        }

        service.isActive = !service.isActive;
        await service.save();

        return res.status(200).json({
            message: service.isActive ? "Service activated" : "Service deactivated",
            service
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to change service status" });
    }
};

module.exports = {
    registerWorker,
    getWorkerProfile,
    updateWorker,
    deleteWorker,
    allWorker,
    getWorkerById,
    addWorkerService,
    removeWorkerService,
    updateWorkerService,
    toggleWorkerService
};