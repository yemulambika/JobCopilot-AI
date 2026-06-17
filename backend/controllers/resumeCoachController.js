const Resume = require("../models/Resume");
const { generateAIResponse } = require("../services/geminiService");

/**
 * @desc    Provide AI-driven resume coaching feedback
 * @route   POST /api/resume-coach
 * @access  Private
 */
const coachResume = async (req, res) => {
  try {
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ error: "resumeId is required" });
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
You are an expert resume coach.  
Analyze the following resume JSON and provide structured feedback.

Return a JSON object with the following schema:

{
  overallScore: number, // 0-100
  sectionFeedback: {
    contact: string[],
    skills: string[],
    experience: string[],
    projects: string[],
    achievements: string[],
    education: string[]
  },
  actionItems: string[]
}

- Detect weak bullet points and suggest stronger action verbs.
- Identify repetitive keywords and recommend variety.
- Provide ATS friendliness tips.
- Keep feedback concise and actionable.

Resume JSON:
${JSON.stringify(resumeJSON, null, 2)}
`;

    const result = await generateAIResponse(prompt, {
      userId: req.user?.id || null,
      systemInstruction: "You are an expert resume coach.",
      maxOutputTokens: 4096,
      temperature: 0.3,
    });

    let feedback;
    try {
      const jsonMatch = result.text.match(/\\{[\\s\\S]*\\}/);
      feedback = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error("Coach parse error:", e);
      feedback = null;
    }

    if (!feedback) {
      return res.status(500).json({
        error: "Failed to parse AI response",
        rawResponse: result.text,
      });
    }

    res.json(feedback);
  } catch (error) {
    console.error("Resume coach error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { coachResume };