const validateRegister = (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (typeof name !== "string" || typeof email !== "string" ||
        typeof password !== "string") {
        return res.status(400).json({ message: "Invalid input" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "Invalid email" });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: "Password must have 8 characters" });
    }

    if (!["customer", "worker"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
    }

    next();
};

module.exports = validateRegister;