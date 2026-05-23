const express = require("express");
const {
  getCategories,
  getCategoryById,
} = require("../controllers/categories.controller");

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);

module.exports = router;
