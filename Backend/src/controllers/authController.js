const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        if (!name || typeof email !== "string" || typeof password !== "string" ||
            password.length < 8 || !["customer", "worker"].includes(role)) {
            return res.status(400).json({ message: "Invalid registration details" });
        }

        const userEmail = email.trim().toLowerCase();
        const exists = await User.findOne({ email: userEmail });

        if (exists) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const hashpassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: userEmail,
            password: hashpassword,
            phone,
            role
        });

        return res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "Email already registered" });
        }
        return res.status(500).json({ message: "Registration failed" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
  message: "Login successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});
    } catch (err) {
        return res.status(500).json({ message: "Login failed" });
    }
};

module.exports = { registerUser, loginUser };