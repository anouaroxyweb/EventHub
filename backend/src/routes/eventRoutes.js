const express = require("express");

const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  updateEventStatus,
} = require("../controllers/eventController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Create event
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "staff"),
  createEvent
);

// Get all events
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "staff"),
  getEvents
);

// Get event details
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "staff"),
  getEventById
);

// Update event
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "staff"),
  updateEvent
);

// Change status
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin", "staff"),
  updateEventStatus
);

module.exports = router;