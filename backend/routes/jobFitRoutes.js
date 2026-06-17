const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { predictJobFit } = require("../controllers/jobFitController");

router.use(protect);

router.post("/predict", predictJobFit);

module.exports = router;