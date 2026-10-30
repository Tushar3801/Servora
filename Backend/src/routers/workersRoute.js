const express = require("express");
const router = express.Router();
const workerController = require("../controllers/workerController");
const { createWorkerService } = require("../controllers/workerServiceController");
const authMiddleware = require("../middleware/authMiddelware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware("worker"), workerController.registerWorker);
router.get("/profile", authMiddleware, roleMiddleware("worker"), workerController.getWorkerProfile);
router.put("/profile", authMiddleware, roleMiddleware("worker"), workerController.updateWorker);
router.delete("/profile", authMiddleware, roleMiddleware("worker"), workerController.deleteWorker);
router.post("/create-service", authMiddleware, roleMiddleware("worker"), createWorkerService);
router.post("/services", authMiddleware, roleMiddleware("worker"), workerController.addWorkerService);
router.put("/services/:serviceId", authMiddleware, roleMiddleware("worker"), workerController.updateWorkerService);
router.patch("/services/:serviceId/toggle", authMiddleware, roleMiddleware("worker"), workerController.toggleWorkerService);
router.delete("/services/:serviceId", authMiddleware, roleMiddleware("worker"), workerController.removeWorkerService);
router.get("/", authMiddleware, workerController.allWorker);
router.get("/:id", workerController.getWorkerById);

module.exports = router;