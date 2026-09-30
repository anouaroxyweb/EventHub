const express = require("express");

const {
  createRegistration,
  getRegistrations,
  updateRegistrationStatus,
} = require("../controllers/registrationController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "staff"),
  createRegistration
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "staff"),
  getRegistrations
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin", "staff"),
  updateRegistrationStatus
);

module.exports = router;