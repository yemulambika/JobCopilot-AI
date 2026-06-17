const Resume = require("../models/Resume");
const { generateAIResponse } = require("../services/geminiService");

/**
 * @desc    Predict job fit for a resume and target role
 * @route   POST /api/job-fit/predict
 * @access  Private
 */
const predictJobFit = async (req, res) => {
  try {
    const { resumeId, targetRole } = req.body;

    if (!resumeId || !targetRole) {
      return res.status(400).json({
        error: "resumeId and targetRole are required",
      });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Build a simple JSON representation of the resume
    const resumeJSON = {
      contact: {},
      skills: [],
      experience: [],
      projects: [],
      achievements: [],
      education: [],
    };

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

    const prompt = `
You are an expert hiring analyst.  
Given a candidate's resume JSON and a target role, compute a job fit prediction.

Return a JSON object with the following schema:

{
  fitScore: number, // 0-100
  strengths: string[],
  weaknesses: string[],
  probabilityOfInterview: number // 0-100
}

Consider technical fit, experience fit, education fit, skill match, and seniority match.  
Provide concise, actionable insights.

Resume JSON:
${JSON.stringify(resumeJSON, null, 2)}

Target role: ${targetRole}
`;

    const result = await generateAIResponse(prompt, {
      userId: req.user?.id || null,
      systemInstruction: "You are an expert hiring analyst.",
      maxOutputTokens: 4096,
      temperature: 0.3,
    });

    let prediction;
    try {
      const jsonMatch = result.text.match(/\\{[\\s\\S]*\\}/);
      prediction = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error("Job fit parse error:", e);
      prediction = null;
    }

    if (!prediction) {
      return res.status(500).json({
        error: "Failed to parse AI response",
        rawResponse: result.text,
      });
    }

    res.json(prediction);
  } catch (error) {
    console.error("Job fit error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { predictJobFit };