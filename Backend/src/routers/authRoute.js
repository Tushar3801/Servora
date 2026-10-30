const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddelware");
const validateRegister = require("../middleware/validateRegister");
const validateLogin = require("../middleware/validateLogin");
const express = require("express");
const app = express.Router();
app.post("/register",authController.registerUser);
app.post("/login",authController.loginUser);
app.post("/register", validateRegister, authController.registerUser);
app.post("/login", validateLogin, authController.loginUser);
app.get("/protected", authMiddleware, (req, res) => {
    res.json({
        message: "You are authenticated",
        user: req.user
    });
});
module.exports = app;