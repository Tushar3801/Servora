const Worker = require("../models/workers");
const Service = require("../models/services");

const createWorkerService = async (req, res) => {
  try {
    const { name, category, description, basePrice, duration } = req.body;

    const worker = await Worker.findOne({ user: req.user.id });

    if (!worker) {
      return res.status(404).json({
        message: "Create your worker profile first"
      });
    }

    if (!name?.trim() || !category?.trim()) {
      return res.status(400).json({
        message: "Service name and category are required"
      });
    }

    if (
      !Number.isFinite(Number(basePrice)) ||
      !Number.isFinite(Number(duration)) ||
      Number(basePrice) <= 0 ||
      Number(duration) <= 0
    ) {
      return res.status(400).json({
        message: "Enter a valid price and duration"
      });
    }

    const service = await Service.create({
    name: name.trim(),
    category: category.trim(),
    description,
    basePrice: Number(basePrice),
    duration: Number(duration),
    worker: worker._id
});

worker.services.push(service._id);
await worker.save();

    return res.status(201).json({
      message: "Service created successfully",
      service
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to create service"
    });
  }
};

module.exports = { createWorkerService };