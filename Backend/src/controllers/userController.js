const User = require("../models/users");

const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch profile" });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const updates = {};

        if (typeof name === "string" && name.trim()) {
            updates.name = name.trim();
        }

        if (typeof phone === "string" && phone.trim()) {
            updates.phone = phone.trim();
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "Provide valid name or phone" });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to update profile" });
    }
};

module.exports = { getMyProfile, updateMyProfile };