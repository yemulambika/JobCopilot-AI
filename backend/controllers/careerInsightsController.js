const { generateAIResponse } = require("../services/geminiService");

/**
 * @desc    Generate comprehensive AI career insights from resume text
 * @route   POST /api/career-insights/analyze
 * @access  Private
 */
const analyzeCareer = async (req, res) => {
  try {
    const { resumeText, targetRole, targetIndustry } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "resumeText is required" });
    }

    const roleContext = targetRole ? `\nTarget role: ${targetRole}` : "";
    const industryContext = targetIndustry ? `\nTarget industry: ${targetIndustry}` : "";

    const systemInstruction = `You are a senior career coach, hiring manager, and market analyst with 15+ years of experience in tech recruiting. You provide actionable, data-driven career insights based on a candidate's resume.

Respond in VALID JSON format with this exact structure:
{
  "resumeScore": {
    "overall": <number 0-100>,
    "breakdown": {
      "content": <number 0-100>,
      "skills": <number 0-100>,
      "experience": <number 0-100>,
      "formatting": <number 0-100>
    },
    "summary": "<brief overall assessment>"
  },
  "skillRecommendations": {
    "inDemand": [
      { "skill": "<name>", "reason": "<why this skill>", "demandLevel": "high|medium", "category": "<category>" }
    ],
    "toLearn": [
      { "skill": "<name>", "priority": "high|medium|low", "timeline": "<e.g. 2-3 months>", "resources": ["<resource URL or name>"] }
    ],
    "existingStrengths": ["<skill already strong>"]
  },
  "marketTrends": {
    "industryOutlook": "<2-3 sentence outlook>",
    "hotRoles": ["<role that's hiring>"],
    "emergingTech": ["<trending technology>"],
    "advice": "<career advice based on market>"
  },
  "salaryEstimation": {
    "range": { "min": <number>, "max": <number>, "currency": "USD" },
    "factors": ["<factors affecting salary>"],
    "note": "<caveat about estimation>"
  },
  "interviewPrep": {
    "commonQuestions": [
      { "question": "<question>", "strategy": "<answer strategy/tips>", "example": "<sample answer opening>" }
    ],
    "technicalTopics": ["<topic to review>"],
    "behavioralTips": ["<tip>"],
    "questionsToAsk": ["<question candidate should ask>"]
  }
}

Be specific, honest, and actionable. Use real market data patterns. Don't fabricate specific numbers without qualifying them as estimates.`;

    const prompt = `Analyze this resume and provide comprehensive career insights.

RESUME TEXT:
${resumeText.substring(0, 5000)}
${roleContext}${industryContext}

Provide a thorough analysis covering:
1. Resume score with breakdown
2. Skill recommendations (in-demand skills to highlight, skills to learn, existing strengths)
3. Market trends for the candidate's field
4. Salary estimation based on experience level and skills
5. Interview preparation (common questions, technical topics, behavioral tips)

Respond with valid JSON only, no markdown formatting.`;

    const result = await generateAIResponse(prompt, {
      systemInstruction,
      maxOutputTokens: 4096,
      temperature: 0.4,
    });

    // Parse JSON from response
    let insights;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      insights = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      insights = null;
    }

    if (!insights) {
      return res.status(200).json({
        insights: { raw: result.text },
        usage: result.usage,
        parseError: true,
      });
    }

    res.json({ insights, usage: result.usage });
  } catch (error) {
    console.error("Career insights error:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

module.exports = { analyzeCareer };