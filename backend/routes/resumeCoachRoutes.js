const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { coachResume } = require("../controllers/resumeCoachController");

router.use(protect);

router.post("/coach", coachResume);

module.exports = router;