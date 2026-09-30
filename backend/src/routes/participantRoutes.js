const express = require("express");

const {
  createParticipant,
  getParticipants,
  updateParticipant,
} = require("../controllers/participantController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Create participant - Admin only
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createParticipant
);

// Get participants - Admin only
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  getParticipants
);

// Update participant - Admin only
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateParticipant
);

module.exports = router;