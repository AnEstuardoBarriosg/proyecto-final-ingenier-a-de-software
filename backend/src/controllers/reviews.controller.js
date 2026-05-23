const reviewsService = require("../services/reviews.service");

const createReview = async (req, res) => {
  try {
    const result = await reviewsService.createReview(
      req.user.id_usuario,
      req.body,
    );

    res.status(201).json({
      ok: true,
      message: "Reseña registrada correctamente",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
};

const getReviewsByProduct = async (req, res) => {
  try {
    const result = await reviewsService.getReviewsByProduct(req.params.id);

    res.status(200).json({
      ok: true,
      message: "Reseñas obtenidas correctamente",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

module.exports = {
  createReview,
  getReviewsByProduct,
};
