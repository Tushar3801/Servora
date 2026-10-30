const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    if (typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({
            message: "Invalid input"
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            message: "Invalid email format"
        });
    }

    next();
};

module.exports = validateLogin;