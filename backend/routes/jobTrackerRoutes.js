const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getJobs,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
} = require("../controllers/jobTrackerController");

router.use(protect);

router.get("/", getJobs);
router.post("/", createJob);
router.put("/:id", updateJob);
router.patch("/:id/status", updateJobStatus);
router.delete("/:id", deleteJob);

module.exports = router;