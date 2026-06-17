const Resume = require("../models/Resume");
const TailoredResume = require("../models/TailoredResume");
const { generateAIResponse } = require("../services/geminiService");

/**
 * @desc    Analyze skill gaps between a resume and a target role
 * @route   POST /api/skill-gap/analyze
 * @access  Private
 */
const analyzeSkillGap = async (req, res) => {
  try {
    const { resumeId, targetRole } = req.body;

    if (!resumeId || !targetRole) {
      return res.status(400).json({
        error: "resumeId and targetRole are required",
      });
    }

    // Fetch the resume (original or tailored)
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Build a JSON representation of the resume
    const resumeJSON = {
      contact: {},
      skills: [],
      experience: [],
      projects: [],
      achievements: [],
      education: [],
    };

    // Very naive parsing of extractedText
    const lines = resume.extractedText.split("\\n");
    let currentSection = null;
    lines.forEach((line) => {
      const txt = line.trim().toLowerCase();
      if (["skills", "experience", "projects", "achievements", "education"].includes(txt)) {
        currentSection = txt;
        return;
      }
      if (!currentSection) return;
      switch (currentSection) {
        case "skills":
          resumeJSON.skills.push(txt);
          break;
        case "experience":
          resumeJSON.experience.push(txt);
          break;
        case "projects":
          resumeJSON.projects.push(txt);
          break;
        case "achievements":
          resumeJSON.achievements.push(txt);
          break;
        case "education":
          resumeJSON.education.push(txt);
          break;
        default:
          break;
      }
    });

    // Prompt Gemini for gap analysis
    const prompt = `
You are an expert career advisor.  
Given a candidate's resume JSON and a target role, compute a skill gap analysis.

Return a JSON object with the following schema:

{
  resumeScore: number, // 0-100
  missingSkills: string[],
  recommendedProjects: string[],
  recommendedCertifications: string[],
  roadmap: string[]
}

Do not add any other keys.  
The resume JSON:
${JSON.stringify(resumeJSON, null, 2)}

Target role: ${targetRole}
`;

    const result = await generateAIResponse(prompt, {
      userId: req.user?.id || null,
      systemInstruction: "You are an expert career advisor.",
      maxOutputTokens: 4096,
      temperature: 0.3,
    });

    let analysis;
    try {
      const jsonMatch = result.text.match(/\\{[\\s\\S]*\\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error("Gap analysis parse error:", e);
      analysis = null;
    }

    if (!analysis) {
      return res.status(500).json({
        error: "Failed to parse AI response",
        rawResponse: result.text,
      });
    }

    res.json(analysis);
  } catch (error) {
    console.error("Skill gap analysis error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { analyzeSkillGap };