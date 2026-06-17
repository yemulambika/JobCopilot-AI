const Resume = require("../models/Resume");
const InterviewSession = require("../models/InterviewSession");
const { generateAIResponse } = require("../services/geminiService");

/**
 * @desc   Start a mock interview session
 * @route  POST /api/mock-interview/start
 * @access Private
 */
const startMockInterview = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({ error: "resumeId and jobDescription are required" });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

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
Given a candidate's resume JSON and a job description, generate 8 interview questions in a random order covering the categories: technical, behavioral, project-based, and HR.

Return a JSON array of strings only (no extra keys).

Resume JSON:
${JSON.stringify(resumeJSON, null, 2)}

Job Description:
${jobDescription}
`;

    const result = await generateAIResponse(prompt, {
      userId: req.user?.id || null,
      systemInstruction: "You are an expert interview coach.",
      maxOutputTokens: 2048,
      temperature: 0.4,
    });

    let questions;
    try {
      const jsonMatch = result.text.match(/\\[\\s\\S]*\\]/);
      questions = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error("Question generation parse error:", e);
      questions = null;
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({
        error: "Failed to generate interview questions",
        rawResponse: result.text,
      });
    }

    const session = await InterviewSession.create({
      userId: req.user.id,
      resumeId,
      jobDescription,
      questions,
      responses: [], // Initialize with empty responses
    });

    res.status(201).json({
      sessionId: session._id,
      question: session.questions[0],
      questionIndex: 0,
      totalQuestions: session.questions.length,
    });
  } catch (error) {
    console.error("Error starting mock interview:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * @desc   Answer a question in the mock interview
 * @route  POST /api/mock-interview/answer
 * @access Private
 */
const answerQuestion = async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Interview session not found" });
    }

    const currentQuestion = session.questions[session.responses.length];

    // Evaluate answer using Gemini
    const evalPrompt = `
You are an expert interviewer.  
Evaluate the candidate's answer to the given question.  
Provide a score (0-100) and constructive feedback.

Return JSON with keys: { "score": number, "feedback": string }

Question: ${currentQuestion}
Answer: ${answer}
`;

    const evalResult = await generateAIResponse(evalPrompt, {
      userId: req.user?.id || null,
      systemInstruction: "You are an expert interviewer.",
      maxOutputTokens: 512,
      temperature: 0.3,
    });

    let evaluation;
    try {
      const jsonMatch = evalResult.text.match(/\{[\s\S]*\}/);
      evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 50, feedback: "Answer parsed incorrectly" };
    } catch (e) {
      evaluation = { score: 50, feedback: "Answer parsed incorrectly" };
    }

    session.responses.push({
      question: currentQuestion,
      answer,
      score: evaluation.score,
      feedback: evaluation.feedback,
    });

    // If finished, calculate final score
    if (session.responses.length >= session.questions.length) {
      const avgScore = session.responses.reduce((sum, r) => sum + r.score, 0) / session.responses.length;
      session.completed = true;
      await session.save();
      return res.status(200).json({
        message: "Interview completed",
        finalScore: avgScore,
        fullFeedback: session.responses,
      });
    }

    await session.save();

    return res.status(200).json({
      message: "Answer recorded",
      nextQuestion: session.questions[session.responses.length],
      questionIndex: session.responses.length,
      totalQuestions: session.questions.length,
      feedback: evaluation,
    });
  } catch (error) {
    console.error("Error answering question:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * @desc   Get interview history for current user
 * @route  GET /api/mock-interview/history
 * @access Private
 */
const getInterviewHistory = async (req, res) => {
  try {
    const history = await InterviewSession.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("-responses"); // Don't send all responses in history list

    res.json(history);
  } catch (error) {
    console.error("Error fetching interview history:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @desc   Get a single interview session with full details
 * @route  GET /api/mock-interview/:id
 * @access Private
 */
const getInterviewSession = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!session) {
      return res.status(404).json({ error: "Interview session not found" });
    }

    res.json(session);
  } catch (error) {
    console.error("Error fetching interview session:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { startMockInterview, answerQuestion, getInterviewHistory, getInterviewSession };
