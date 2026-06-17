const JobApplication = require("../models/JobApplication");

/**
 * @desc    Get all job applications for current user
 * @route   GET /api/jobs
 * @access  Private
 */
const getJobs = async (req, res) => {
  try {
    const jobs = await JobApplication.find({ userId: req.user.id })
      .sort({ updatedAt: -1 });
    res.json({ count: jobs.length, jobs });
  } catch (error) {
    console.error("GetJobs error:", error);
    res.status(500).json({ error: "Failed to fetch job applications" });
  }
};

/**
 * @desc    Create a new job application
 * @route   POST /api/jobs
 * @access  Private
 */
const createJob = async (req, res) => {
  try {
    const { company, role, source, status, appliedDate, notes } = req.body;

    if (!company || !role) {
      return res.status(400).json({ error: "Company and role are required" });
    }

    const job = await JobApplication.create({
      userId: req.user.id,
      company: company.trim(),
      role: role.trim(),
      source: source || "",
      status: status || "saved",
      appliedDate: appliedDate || null,
      notes: notes || "",
    });

    console.log(`✅ Job created: ${job._id} - ${job.company} / ${job.role}`);
    res.status(201).json({ job });
  } catch (error) {
    console.error("CreateJob error:", error);
    res.status(500).json({ error: "Failed to create job application" });
  }
};

/**
 * @desc    Update a job application
 * @route   PUT /api/jobs/:id
 * @access  Private
 */
const updateJob = async (req, res) => {
  try {
    const { company, role, source, status, appliedDate, notes } = req.body;

    const job = await JobApplication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { company, role, source, status, appliedDate, notes },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ error: "Job application not found" });
    }

    console.log(`✅ Job updated: ${job._id} → ${job.status}`);
    res.json({ job });
  } catch (error) {
    console.error("UpdateJob error:", error);
    res.status(500).json({ error: "Failed to update job application" });
  }
};

/**
 * @desc    Update job status only (for drag-and-drop)
 * @route   PATCH /api/jobs/:id/status
 * @access  Private
 */
const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["saved", "applied", "interview", "rejected", "offer"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const job = await JobApplication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ error: "Job application not found" });
    }

    console.log(`✅ Job status updated: ${job._id} → ${status}`);
    res.json({ job });
  } catch (error) {
    console.error("UpdateJobStatus error:", error);
    res.status(500).json({ error: "Failed to update job status" });
  }
};

/**
 * @desc    Delete a job application
 * @route   DELETE /api/jobs/:id
 * @access  Private
 */
const deleteJob = async (req, res) => {
  try {
    const job = await JobApplication.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!job) {
      return res.status(404).json({ error: "Job application not found" });
    }

    console.log(`🗑 Job deleted: ${job._id}`);
    res.json({ message: "Job application deleted" });
  } catch (error) {
    console.error("DeleteJob error:", error);
    res.status(500).json({ error: "Failed to delete job application" });
  }
};

module.exports = { getJobs, createJob, updateJob, updateJobStatus, deleteJob };