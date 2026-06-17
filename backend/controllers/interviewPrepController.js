const Resume = require("../models/Resume");
const { generateAIResponse } = require("../services/geminiService");

/**
 * @desc    Generate interview preparation questions
 * @route   POST /api/interview-prep
 * @access  Private
 */
const generateInterviewPrep = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({
        error: "resumeId and jobDescription are required",
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
You are an expert interview coach.  
Given a candidate's resume JSON and a job description, generate a set of interview questions in four categories:

{
  technical: string[],
  behavioral: string[],
  projectBased: string[],
  hr: string[]
}

Also provide a short answer key for each question.  
Return a JSON object with the above structure.

Resume JSON:
${JSON.stringify(resumeJSON, null, 2)}

Job Description:
${jobDescription}
`;

    const result = await generateAIResponse(prompt, {
      userId: req.user?.id || null,
      systemInstruction: "You are an expert interview coach.",
      maxOutputTokens: 8192,
      temperature: 0.3,
    });

    let questions;
    try {
      const jsonMatch = result.text.match(/\\{[\\s\\S]*\\}/);
      questions = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error("Interview prep parse error:", e);
      questions = null;
    }

    if (!questions) {
      return res.status(500).json({
        error: "Failed to parse AI response",
        rawResponse: result.text,
      });
    }

    res.json(questions);
  } catch (error) {
    console.error("Interview prep error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { generateInterviewPrep };