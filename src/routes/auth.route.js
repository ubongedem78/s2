const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/auth.controller");
const { check } = require("express-validator");
const validate = require("../middlewares/validate");

router.post(
  "/auth/register",
  [
    check("firstName").not().isEmpty().withMessage("First name is required"),
    check("lastName").not().isEmpty().withMessage("Last name is required"),
    check("email").isEmail().withMessage("Valid email is required"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    check("phone").not().isEmpty().withMessage("Phone number is required"),
  ],
  validate,
  register
);

router.post(
  "/auth/login",
  [
    check("email").isEmail().withMessage("Email is invalid"),
    check("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

module.exports = router;
