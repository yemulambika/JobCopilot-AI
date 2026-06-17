const TailoredResume = require("../models/TailoredResume");
const Resume = require("../models/Resume");
const { generateAIResponse } = require("../services/geminiService");

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) optimizer and resume tailoring specialist. Given a master resume and job description, you must tailor the resume to maximize ATS compatibility and interview chances. Always return valid JSON with the exact structure requested.`;

const tailorResume = async (req, res) => {
  try {
    const { masterResumeText, jobDescription, resumeId } = req.body;

    if (!masterResumeText || !jobDescription) {
      return res.status(400).json({
        error: "masterResumeText and jobDescription are required",
      });
    }

    const prompt = `You are an expert resume tailoring specialist. Analyze the master resume and the job description below. Tailor the resume for maximum ATS compatibility.

Return ONLY valid JSON with this exact structure:
{
  "tailoredSummary": "string — A 2-3 sentence professional summary tailored to the job",
  "optimizedSkills": ["skill1", "skill2", ...] — Skills reordered to prioritize JD matches,
  "improvedExperience": [
    {
      "original": "original bullet point from resume",
      "improved": "improved bullet point tailored to JD with quantified achievements"
    }
  ] — Top experience bullet points rewritten for the target role,
  "atsKeywords": ["keyword1", "keyword2", ...] — Critical ATS keywords from the JD that should appear in the resume
}

MASTER RESUME:
${masterResumeText}

JOB DESCRIPTION:
${jobDescription}`;

    const result = await generateAIResponse(prompt, {
      userId: req.user?.id || null,
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 4096,
      temperature: 0.4,
    });

    let parsed;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr);
      parsed = null;
    }

    if (!parsed) {
      return res.status(500).json({
        error: "Failed to parse AI response. Please try again.",
        rawResponse: result.text,
      });
    }

    const tailored = await TailoredResume.create({
      userId: req.user.id,
      masterResumeId: resumeId || null,
      jobDescription,
      tailoredSummary: parsed.tailoredSummary || "",
      optimizedSkills: parsed.optimizedSkills || [],
      improvedExperience: parsed.improvedExperience || [],
      atsKeywords: parsed.atsKeywords || [],
      rawResponse: result.text,
    });

    res.status(201).json({
      message: "Resume tailored successfully",
      tailored: {
        id: tailored._id,
        tailoredSummary: tailored.tailoredSummary,
        optimizedSkills: tailored.optimizedSkills,
        improvedExperience: tailored.improvedExperience,
        atsKeywords: tailored.atsKeywords,
        createdAt: tailored.createdAt,
      },
      usage: result.usage,
    });
  } catch (error) {
    console.error("Tailor error:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getTailoredResumes = async (req, res) => {
  try {
    const tailored = await TailoredResume.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("-rawResponse");

    res.json({
      count: tailored.length,
      tailored,
    });
  } catch (error) {
    console.error("GetTailored error:", error);
    res.status(500).json({ error: "Failed to fetch tailored resumes" });
  }
};

const getTailoredResume = async (req, res) => {
  try {
    const tailored = await TailoredResume.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!tailored) {
      return res.status(404).json({ error: "Tailored resume not found" });
    }

    res.json({ tailored });
  } catch (error) {
    console.error("GetTailoredResume error:", error);
    res.status(500).json({ error: "Failed to fetch tailored resume" });
  }
};

const deleteTailoredResume = async (req, res) => {
  try {
    const tailored = await TailoredResume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!tailored) {
      return res.status(404).json({ error: "Tailored resume not found" });
    }

    res.json({ message: "Tailored resume deleted" });
  } catch (error) {
    console.error("DeleteTailored error:", error);
    res.status(500).json({ error: "Failed to delete tailored resume" });
  }
};

module.exports = {
  tailorResume,
  getTailoredResumes,
  getTailoredResume,
  deleteTailoredResume,
};