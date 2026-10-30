const express = require("express");
const app = express.Router();
const serviceController = require("../controllers/serviceController");
const authMiddelware = require("../middleware/authMiddelware");
const roleMiddleware = require("../middleware/roleMiddleware");

app.post("/", authMiddelware, roleMiddleware("admin"), serviceController.createService);

app.get("/getServices", serviceController.getAllServices);

app.get("/:id", serviceController.getServiceById);

app.put("/:id", authMiddelware, roleMiddleware("admin"), serviceController.updateService);

app.delete("/:id", authMiddelware, roleMiddleware("admin"), serviceController.deleteService);

app.patch("/:id/deactivate", authMiddelware, roleMiddleware("admin"), serviceController.deactivateService);

module.exports = app;