const Email = require("../models/Email");
const { generateAIResponse } = require("../services/geminiService");

// ─── Email type prompts ────────────────────────────────────

const EMAIL_PROMPTS = {
  recruiter: (data) => `Write a professional outreach email to a recruiter about the ${data.jobTitle || "open position"} at ${data.companyName || "the company"}.

Recipient name: ${data.recipientName || "Hiring Manager"}
Job Title: ${data.jobTitle || "N/A"}
Tone: ${data.tone}

Include:
- Brief self-introduction
- Why you're interested in the role
- Key relevant skills and experience
- Call to action (request for a conversation)

${data.resumeText ? `RESUME SUMMARY:\n${data.resumeText.substring(0, 1500)}` : ""}

Return ONLY valid JSON:
{
  "subject": "email subject line",
  "body": "the full email body"
}`,

  referral: (data) => `Write a referral request email for the ${data.jobTitle || "open position"} at ${data.companyName || "the company"}.

Recipient name: ${data.recipientName || "Contact"}
Job Title: ${data.jobTitle || "N/A"}
Tone: ${data.tone}

Include:
- Warm opening referencing your connection
- Specific role you're interested in
- Brief highlight of why you're a good fit
- Ask for a referral or introduction

${data.resumeText ? `RESUME SUMMARY:\n${data.resumeText.substring(0, 1500)}` : ""}

Return ONLY valid JSON:
{
  "subject": "email subject line",
  "body": "the full email body"
}`,

  followup: (data) => `Write a follow-up email after applying for ${data.jobTitle || "a position"} at ${data.companyName || "the company"}.

Recipient name: ${data.recipientName || "Hiring Manager"}
Job Title: ${data.jobTitle || "N/A"}
Tone: ${data.tone}

Include:
- Reference to your application
- Reiterate enthusiasm for the role
- Brief reminder of your value
- Polite request for status update

Return ONLY valid JSON:
{
  "subject": "email subject line",
  "body": "the full email body"
}`,

  thankyou: (data) => `Write a thank-you email after an interview for ${data.jobTitle || "a position"} at ${data.companyName || "the company"}.

Recipient name: ${data.recipientName || "Interviewer"}
Job Title: ${data.jobTitle || "N/A"}
Tone: ${data.tone}

Include:
- Thank them for their time
- Reference something specific from the interview
- Reinforce your enthusiasm
- Mention any follow-up items
- Professional closing

Return ONLY valid JSON:
{
  "subject": "email subject line",
  "body": "the full email body"
}`,
};

const SYSTEM_PROMPT = `You are an expert email writer specializing in professional career communications. You write clear, concise, and effective emails. Always return valid JSON with "subject" and "body" fields.`;

/**
 * @desc    Generate an AI email and save to MongoDB
 * @route   POST /api/emails/generate
 * @access  Private
 */
const generateEmail = async (req, res) => {
  try {
    const {
      emailType,
      tone,
      recipientName,
      companyName,
      jobTitle,
      jobDescription,
      resumeText,
      resumeId,
    } = req.body;

    if (!emailType) {
      return res.status(400).json({ error: "emailType is required" });
    }

    if (!EMAIL_PROMPTS[emailType]) {
      return res.status(400).json({
        error: `Invalid emailType. Must be: recruiter, referral, followup, thankyou`,
      });
    }

    const toneLabel = tone || "formal";
    const data = {
      recipientName,
      companyName,
      jobTitle,
      jobDescription,
      resumeText,
      tone: toneLabel,
    };

    const prompt = EMAIL_PROMPTS[emailType](data);

    const result = await generateAIResponse(prompt, {
      userId: req.user?.id || null,
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 2048,
      temperature: 0.7,
    });

    // Parse JSON from response
    let parsed;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      parsed = null;
    }

    if (!parsed) {
      return res.status(500).json({
        error: "Failed to parse AI response",
        rawResponse: result.text,
      });
    }

    // Save to MongoDB
    const email = await Email.create({
      userId: req.user.id,
      resumeId: resumeId || null,
      emailType,
      tone: toneLabel,
      recipientName: recipientName || "",
      companyName: companyName || "",
      jobTitle: jobTitle || "",
      jobDescription: jobDescription || "",
      resumeText: resumeText || "",
      subject: parsed.subject || "",
      content: parsed.body || result.text,
    });

    console.log(`✅ Email generated: ${email._id} (${emailType})`);

    res.status(201).json({
      message: "Email generated successfully",
      email: {
        id: email._id,
        emailType: email.emailType,
        tone: email.tone,
        subject: email.subject,
        content: email.content,
        createdAt: email.createdAt,
      },
      usage: result.usage,
    });
  } catch (error) {
    console.error("Email generate error:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

/**
 * @desc    Get all emails for current user
 * @route   GET /api/emails
 * @access  Private
 */
const getEmails = async (req, res) => {
  try {
    const emails = await Email.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("-resumeText -jobDescription");

    res.json({
      count: emails.length,
      emails,
    });
  } catch (error) {
    console.error("GetEmails error:", error);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
};

/**
 * @desc    Get a single email by ID
 * @route   GET /api/emails/:id
 * @access  Private
 */
const getEmail = async (req, res) => {
  try {
    const email = await Email.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!email) {
      return res.status(404).json({ error: "Email not found" });
    }

    res.json({ email });
  } catch (error) {
    console.error("GetEmail error:", error);
    res.status(500).json({ error: "Failed to fetch email" });
  }
};

/**
 * @desc    Delete an email
 * @route   DELETE /api/emails/:id
 * @access  Private
 */
const deleteEmail = async (req, res) => {
  try {
    const email = await Email.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!email) {
      return res.status(404).json({ error: "Email not found" });
    }

    res.json({ message: "Email deleted" });
  } catch (error) {
    console.error("DeleteEmail error:", error);
    res.status(500).json({ error: "Failed to delete email" });
  }
};

module.exports = { generateEmail, getEmails, getEmail, deleteEmail };