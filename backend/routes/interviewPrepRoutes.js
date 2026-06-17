const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { generateInterviewPrep } = require("../controllers/interviewPrepController");

router.use(protect);

router.post("/", generateInterviewPrep);

module.exports = router;