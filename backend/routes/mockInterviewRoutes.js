
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  startMockInterview,
  answerQuestion,
  getInterviewHistory,
  getInterviewSession,
} = require("../controllers/mockInterviewController");

router.use(protect);

router.post("/start", startMockInterview);
router.post("/answer", answerQuestion);
router.get("/history", getInterviewHistory);
router.get("/:id", getInterviewSession);

module.exports = router;
