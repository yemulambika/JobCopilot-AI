const JobApplication = require("../models/JobApplication");
const { generateAIResponse } = require("../services/geminiService");

/**
 * @desc    Submit job from Chrome extension to job tracker
 * @route   POST /api/extension/submit-job
 * @access  Public (extension uses auth header if available)
 */
const submitJobFromExtension = async (req, res) => {
  try {
    const { company, role, source, description, skills, url } = req.body;

    if (!company || !role) {
      return res.status(400).json({ error: "Company and role are required" });
    }

    // Check if a user is authenticated (optional via Bearer token)
    let userId = null;
    if (req.user?.id) {
      userId = req.user.id;
    } else if (req.body.userId) {
      userId = req.body.userId;
    } else {
      // Create job as untracked (for unauthenticated extension users)
      return res.status(200).json({
        message: "Job received. Login to save it to your tracker.",
        job: { company, role, source, skills, description: description?.substring(0, 200) },
        requiresAuth: true,
      });
    }

    // Check for duplicate (same company + role + user within last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const existing = await JobApplication.findOne({
      userId,
      company: { $regex: new RegExp(company, "i") },
      role: { $regex: new RegExp(role, "i") },
      createdAt: { $gte: sevenDaysAgo },
    });

    if (existing) {
      return res.status(200).json({
        message: "Job already exists in your tracker",
        job: existing,
        isDuplicate: true,
      });
    }

    // Build notes with description and skills
    let notes = "";
    if (skills && skills.length > 0) {
      notes += `Extracted Skills:\n${skills.join(", ")}\n\n`;
    }
    if (description) {
      notes += `Job Description:\n\n${description.substring(0, 2000)}`;
    }

    // Save to job tracker
    const job = await JobApplication.create({
      userId,
      company: company.trim(),
      role: role.trim(),
      source: source ? `${source}${url ? ` - ${url}` : ""}` : url || "",
      status: "saved",
      notes,
    });

    console.log(`🔌 Job submitted from extension: ${job.company} / ${job.role} → ${skills?.length || 0} skills`);

    res.status(201).json({
      message: "Job saved to your tracker!",
      job: {
        id: job._id,
        company: job.company,
        role: job.role,
        status: job.status,
        source: job.source,
        skills: skills || [],
      },
    });
  } catch (error) {
    console.error("Extension submit job error:", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

/**
 * @desc    Generate answer for a custom application question
 * @route   POST /api/extension/answer-question
 * @access  Public (optional auth)
 */
const answerQuestion = async (req, res) => {
  try {
    const { question, resumeText, jobDescription, companyName, roleName } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const contextParts = [];
    if (resumeText) contextParts.push(`CANDIDATE RESUME:\n${resumeText.substring(0, 4000)}`);
    if (jobDescription) contextParts.push(`JOB DESCRIPTION:\n${jobDescription.substring(0, 3000)}`);

    const systemInstruction = `You are a professional career coach and resume expert. You help candidates write compelling, honest, and concise answers to job application questions. Your answers should:
- Be tailored to the specific job and company
- Highlight relevant skills and experience from the resume
- Be professional yet personable
- Be concise but thorough (150-300 words unless the question implies a shorter answer)
- Never make up experience the candidate doesn't have
- Use specific examples from the resume when possible`;

    const contextBlock = contextParts.length > 0
      ? `\n\nHere is the context:\n\n${contextParts.join("\n\n")}`
      : "\n\nNote: No resume or job description was provided. Give a general professional answer and note that more context would improve the response.";

    const companyBlock = companyName ? `\n\nTarget company: ${companyName}` : "";
    const roleBlock = roleName ? `\n\nTarget role: ${roleName}` : "";

    const prompt = `Answer this job application question concisely and professionally.

QUESTION: "${question}"
${companyBlock}${roleBlock}${contextBlock}

Write a polished, ready-to-use answer. Do not include the question itself, just the answer text. Do not use markdown formatting — write plain text only.`;

    const result = await generateAIResponse(prompt, {
      systemInstruction,
      maxOutputTokens: 1024,
      temperature: 0.6,
    });

    res.json({
      answer: result.text,
      question,
      usage: result.usage,
    });
  } catch (error) {
    console.error("Extension answer question error:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

module.exports = { submitJobFromExtension, answerQuestion };
