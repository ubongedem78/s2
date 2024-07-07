const express = require("express");
const router = express.Router();
const { getUserById } = require("../controllers/user.controller");
const authenticate = require("../middlewares/auth");

router.get("/users/:id", authenticate, getUserById);

module.exports = router;
