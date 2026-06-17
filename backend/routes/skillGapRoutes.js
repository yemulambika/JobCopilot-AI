const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { analyzeSkillGap } = require("../controllers/skillGapController");

router.use(protect);

router.post("/analyze", analyzeSkillGap);

module.exports = router;