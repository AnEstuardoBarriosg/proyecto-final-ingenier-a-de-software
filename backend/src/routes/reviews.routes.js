const express = require("express");
const authenticateToken = require("../middlewares/auth.middleware");
const {
  createReview,
  getReviewsByProduct,
} = require("../controllers/reviews.controller");

const router = express.Router();

router.post("/", authenticateToken, createReview);
router.get("/product/:id", getReviewsByProduct);

module.exports = router;
