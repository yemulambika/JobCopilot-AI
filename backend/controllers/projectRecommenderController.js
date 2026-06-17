const Resume = require("../models/Resume");
const { generateAIResponse } = require("../services/geminiService");

/**
 * @desc    Recommend projects for skill development
 * @route   POST /api/project-recommender
 * @access  Private
 */
const recommendProjects = async (req, res) => {
  try {
    const { resumeId, careerGoal, missingSkills } = req.body;

    if (!resumeId || !careerGoal) {
      return res.status(400).json({
        error: "resumeId and careerGoal are required",
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
You are an expert career development coach.  
Given a candidate's resume JSON, a career goal, and a list of missing skills, recommend a set of projects to build those skills.

Return a JSON array of objects with the following schema:

{
  title: string,
  difficulty: string, // e.g., Beginner, Intermediate, Advanced
  technologies: string[],
  learningOutcome: string
}

Provide 3-5 project ideas.  
If missingSkills is provided, prioritize projects that cover those skills.

Resume JSON:
${JSON.stringify(resumeJSON, null, 2)}

Career Goal: ${careerGoal}
${missingSkills ? `Missing Skills: ${missingSkills.join(", ")}` : ""}
`;

    const result = await generateAIResponse(prompt, {
      userId: req.user?.id || null,
      systemInstruction: "You are an expert career development coach.",
      maxOutputTokens: 4096,
      temperature: 0.3,
    });

    let projects;
    try {
      const jsonMatch = result.text.match(/\\[\\s\\S]*\\]/);
      projects = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error("Project recommender parse error:", e);
      projects = null;
    }

    if (!projects) {
      return res.status(500).json({
        error: "Failed to parse AI response",
        rawResponse: result.text,
      });
    }

    res.json(projects);
  } catch (error) {
    console.error("Project recommender error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { recommendProjects };