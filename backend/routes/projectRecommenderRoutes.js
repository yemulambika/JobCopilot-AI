const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { recommendProjects } = require("../controllers/projectRecommenderController");

router.use(protect);

router.post("/", recommendProjects);

module.exports = router;