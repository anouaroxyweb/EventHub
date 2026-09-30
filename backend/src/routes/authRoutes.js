const express = require("express");
const { login, getMe } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/login", login);

router.get(
  "/me",
  authMiddleware,
  roleMiddleware("admin"),
  getMe
);

module.exports = router;