const fs = require("fs");
const path = require("path");
const Resume = require("../models/Resume");
const docParserService = require("../services/docParser");

/**
 * @desc    Upload and parse a PDF or DOCX resume, save to MongoDB
 * @route   POST /api/resumes/upload
 * @access  Private
 */
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const originalFile = req.file.originalname;
    const mimeType = req.file.mimetype;
    const fileType = mimeType === "application/pdf" ? "pdf" : "docx";

    // Extract text from PDF or DOCX
    const extractedText = await docParserService.extractText(filePath, mimeType);

    // Save to MongoDB
    const resume = await Resume.create({
      userId: req.user.id,
      originalFile,
      fileType,
      extractedText,
    });

    // Clean up uploaded file after parsing
    fs.unlinkSync(filePath);

    res.status(201).json({
      message: "Resume uploaded and parsed successfully",
      resume: {
        id: resume._id,
        originalFile: resume.originalFile,
        fileType: resume.fileType,
        extractedText: resume.extractedText,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Failed to upload and parse resume" });
  }
};

/**
 * @desc    Get all resumes for the logged-in user
 * @route   GET /api/resumes
 * @access  Private
 */
const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("-extractedText"); // Exclude text for list view

    res.json({
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    console.error("GetResumes error:", error);
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
};

/**
 * @desc    Get a single resume with full extracted text
 * @route   GET /api/resumes/:id
 * @access  Private
 */
const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    res.json({
      resume,
    });
  } catch (error) {
    console.error("GetResume error:", error);
    res.status(500).json({ error: "Failed to fetch resume" });
  }
};

/**
 * @desc    Delete a resume
 * @route   DELETE /api/resumes/:id
 * @access  Private
 */
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("DeleteResume error:", error);
    res.status(500).json({ error: "Failed to delete resume" });
  }
};

/**
 * @desc    Match resume text against job description (Advanced ATS Analysis)
 * @route   POST /api/match
 * @access  Public
 */
const matchResume = async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  if (!resumeText || !jobDescription) {
    return res
      .status(400)
      .json({ error: "resumeText and jobDescription are required" });
  }

  const skillMatcherService = require("../services/skillMatcher");
  const {
    generateExplanation,
    generateStrengths,
    generateWeakAreas,
    generateSuggestions,
  } = require("../utils/helpers");

  try {
    const result = await skillMatcherService.getAdvancedScore(
      resumeText,
      jobDescription
    );

    const strengths = generateStrengths(result.matched);
    const weakAreas = generateWeakAreas(result.missing);
    const suggestions = generateSuggestions(result.missing, weakAreas);
    const explanation = generateExplanation(
      result.score,
      result.matched,
      result.missing
    );

    console.log("📊 ATS Analysis Complete:", {
      score: result.score,
      matched: result.matched.length,
      missing: result.missing.length,
      semanticScore: result.semanticScore,
    });

    res.json({
      score: result.score,
      matched: result.matched,
      missing: result.missing,
      extraResumeSkills: result.extraResumeSkills,
      explanation,
      strengths,
      weakAreas,
      suggestions,
      semanticScore: result.semanticScore,
      resumeKeywords: result.resumeKeywords,
      jdKeywords: result.jdKeywords,
    });
  } catch (error) {
    console.error("Match error:", error);
    res.status(500).json({ error: "Failed to match resume" });
  }
};

module.exports = { uploadResume, getResumes, getResume, deleteResume, matchResume };
