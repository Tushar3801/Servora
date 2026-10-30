const validateWorker = (req, res, next) => {
    const { name, skill, experience, location, hourlyRate, availability } = req.body;

    if (req.method === "POST" && (!name || !skill || !location)) {
        return res.status(400).json({ message: "Required fields missing" });
    }

    if (experience !== undefined && (!Number.isInteger(experience) || experience < 0)) {
        return res.status(400).json({ message: "Invalid experience" });
    }

    if (hourlyRate !== undefined && (typeof hourlyRate !== "number" || hourlyRate < 0)) {
        return res.status(400).json({ message: "Invalid hourly rate" });
    }

    if (availability !== undefined && typeof availability !== "boolean") {
        return res.status(400).json({ message: "Invalid availability" });
    }

    next();
};

module.exports = validateWorker;