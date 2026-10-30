const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddelware");
router.get("/myProfile",authMiddleware,userController.getMyProfile);
router.patch("/profile", authMiddleware, userController.updateMyProfile);
module.exports = router;