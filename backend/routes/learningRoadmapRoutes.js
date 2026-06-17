
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { generateLearningRoadmap } = require("../controllers/learningRoadmapController");

router.use(protect);

router.post("/", generateLearningRoadmap);

module.exports = router;
