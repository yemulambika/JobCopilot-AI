
const { generateAIResponse } = require("../services/geminiService");

/**
 * @desc    Generate a learning roadmap for a given career goal
 * @route   POST /api/learning-roadmap
 * @access  Private
 */
const generateLearningRoadmap = async (req, res) => {
  try {
    const { careerGoal } = req.body;

    if (!careerGoal) {
      return res.status(400).json({ error: "careerGoal is required" });
    }

    const prompt = `
You are an expert career development coach.  
Given a career goal, generate a comprehensive learning roadmap.

Return a JSON object with the following schema:

{
  careerGoal: string,
  skillsToLearn: string[],
  recommendedTimeline: string, // e.g., "6-12 months", "1-2 years"
  suggestedProjects: [
    {
      title: string,
      description: string,
      technologies: string[]
    }
  ],
  studyPlan: string[] // Week-by-week or phase-based study plan
}

Make the roadmap practical and actionable.

Career Goal: ${careerGoal}
`;

    const result = await generateAIResponse(prompt, {
      userId: req.user?.id || null,
      systemInstruction: "You are an expert career development coach.",
      maxOutputTokens: 8192,
      temperature: 0.5,
    });

    let roadmap;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      roadmap = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error("Learning roadmap parse error:", e);
      roadmap = null;
    }

    if (!roadmap) {
      return res.status(500).json({
        error: "Failed to generate learning roadmap",
        rawResponse: result.text,
      });
    }

    res.json(roadmap);
  } catch (error) {
    console.error("Learning roadmap error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { generateLearningRoadmap };
