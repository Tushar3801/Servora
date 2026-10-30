const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    basePrice: Number,
    duration: Number,
    isActive: { type: Boolean, default: true },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "workers",
        default: null
    }
});

module.exports = mongoose.model("services", serviceSchema);