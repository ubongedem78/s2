const express = require("express");
const router = express.Router();
const {
  createOrganisation,
  getOrganisations,
  getOrganisationById,
  addUserToOrganisation,
} = require("../controllers/org.controller");
const authenticate = require("../middlewares/auth");
const { check } = require("express-validator");
const validate = require("../middlewares/validate");

router.get("/organisations", authenticate, getOrganisations);
router.get("/organisations/:orgId", authenticate, getOrganisationById);

router.post(
  "/organisations",
  authenticate,
  [
    check("name").notEmpty().withMessage("Name is required"),
    check("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
  ],
  validate,
  createOrganisation
);

router.post(
  "/organisations/:orgId/users",
  authenticate,
  [check("userId").notEmpty().withMessage("User ID is required")],
  validate,
  addUserToOrganisation
);

module.exports = router;
