const TailoredResume = require("../models/TailoredResume");
const CoverLetter = require("../models/CoverLetter");
const fs = require("fs");
const {
  generateTailoredResumePDF,
  generateCoverLetterPDF,
} = require("../services/pdfGenerator");

/**
 * @desc    Download a tailored resume as PDF
 * @route   GET /api/export/tailored-resume/:id/pdf
 * @access  Private
 */
const downloadTailoredResumePDF = async (req, res) => {
  try {
    const tailored = await TailoredResume.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!tailored) {
      return res.status(404).json({ error: "Tailored resume not found" });
    }

    const originalPdfPath = `Ai-Resume-Maker/backend/uploads/${tailored._id}.pdf`;
    const originalPdfBuffer = await fs.promises.readFile(originalPdfPath);
    const pdfBuffer = await generateTailoredResumePDF(originalPdfBuffer, tailored.jobDescription);

    const filename = `tailored-resume-${tailored._id}-${Date.now()}.pdf`;

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
    console.log(`📄 Exported tailored resume PDF: ${tailored._id}`);
  } catch (error) {
    console.error("Export tailored resume PDF error:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};

/**
 * @desc    Download a cover letter as PDF
 * @route   GET /api/export/cover-letter/:id/pdf
 * @access  Private
 */
const downloadCoverLetterPDF = async (req, res) => {
  try {
    const coverLetter = await CoverLetter.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!coverLetter) {
      return res.status(404).json({ error: "Cover letter not found" });
    }

    const pdfBuffer = await generateCoverLetterPDF({
      content: coverLetter.content,
      tone: coverLetter.tone,
    });

    const filename = `cover-letter-${coverLetter._id}-${Date.now()}.pdf`;

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
    console.log(`📄 Exported cover letter PDF: ${coverLetter._id}`);
  } catch (error) {
    console.error("Export cover letter PDF error:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};

module.exports = { downloadTailoredResumePDF, downloadCoverLetterPDF };