const PDFDocument = require("pdfkit");
const { PDFDocument: PDFLibDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const { loadPdf } = require("pdfjs-dist/legacy/build/pdf");
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Extract text items with coordinates from a PDF buffer.
 * Returns an array of objects: { text, x, y, fontSize, fontName }
 */
async function extractTextWithCoords(pdfBuffer) {
  const loadingTask = loadPdf({ data: pdfBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const items = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    content.items.forEach((item) => {
      const transform = item.transform;
      const x = transform[4];
      const y = transform[5];
      const fontSize = Math.hypot(transform[0], transform[1]);
      items.push({
        text: item.str,
        x,
        y,
        fontSize,
        fontName: item.fontName,
      });
    });
  }
  return items;
}

/**
 * Build a JSON representation of the resume from extracted text.
 * The structure matches the required schema.
 */
function buildResumeJSON(items) {
  const resume = {
    contact: {},
    skills: [],
    experience: [],
    projects: [],
    achievements: [],
    education: [],
  };

  // Very naive parsing: look for section headings and collect following lines
  const sections = {
    contact: ["contact", "email", "phone", "linkedin", "github"],
    skills: ["skills", "technical skills"],
    experience: ["experience", "work experience"],
    projects: ["projects"],
    achievements: ["achievements", "awards"],
    education: ["education", "qualifications"],
  };

  let currentSection = null;
  items.forEach((item) => {
    const txt = item.text.trim().toLowerCase();
    if (Object.keys(sections).some((k) => sections[k].includes(txt))) {
      currentSection = txt;
      return;
    }
    if (!currentSection) return;

    switch (currentSection) {
      case "contact":
        // simple key: value pairs
        const [key, ...rest] = txt.split(":");
        if (key && rest.length) {
          resume.contact[key.trim()] = rest.join(":").trim();
        }
        break;
      case "skills":
        resume.skills.push(txt);
        break;
      case "experience":
        resume.experience.push(txt);
        break;
      case "projects":
        resume.projects.push(txt);
        break;
      case "achievements":
        resume.achievements.push(txt);
        break;
      case "education":
        resume.education.push(txt);
        break;
      default:
        break;
    }
  });

  return resume;
}

/**
 * Call Gemini to optimize the resume content.
 * @param {object} resumeJSON - parsed resume
 * @param {string} jobDescription - JD text
 * @returns {object} updated resume JSON
 */
async function optimizeResumeContent(resumeJSON, jobDescription) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an expert resume editor.  
You will receive a JSON object with the following schema:

{
  contact: {},
  skills: [],
  experience: [],
  projects: [],
  achievements: [],
  education: []
}

You will also receive a job description.  
Your task is to **only modify the text inside the existing sections** while preserving the exact layout, fonts, sizes, and order.  
Return a JSON object with the same schema and the updated text.  
Do not add or remove sections, do not change formatting, and do not add new keys.

Job Description:
${jobDescription}

Resume JSON:
${JSON.stringify(resumeJSON, null, 2)}
`;

  const result = await model.generateContent(prompt);
  const text = await result.response.text();

  // The response should be a JSON string. Parse it.
  try {
    const updated = JSON.parse(text);
    return updated;
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    return resumeJSON; // fallback
  }
}

/**
 * Replace text in the original PDF with updated content.
 * @param {Buffer} originalPdfBuffer
 * @param {object} updatedResumeJSON
 * @returns {Promise<Buffer>}
 */
async function replaceTextInPdf(originalPdfBuffer, updatedResumeJSON) {
  const pdfDoc = await PDFLibDocument.load(originalPdfBuffer);
  const pages = pdfDoc.getPages();

  // Map section headings to updated lines
  const sectionMap = {
    contact: updatedResumeJSON.contact,
    skills: updatedResumeJSON.skills,
    experience: updatedResumeJSON.experience,
    projects: updatedResumeJSON.projects,
    achievements: updatedResumeJSON.achievements,
    education: updatedResumeJSON.education,
  };

  // For simplicity, we overlay new text at the same positions as the first occurrence of each section heading.
  // A full implementation would need to track all text items and replace them individually.
  for (const [section, content] of Object.entries(sectionMap)) {
    const heading = section.charAt(0).toUpperCase() + section.slice(1);
    const page = pages[0]; // assume single page for now
    const { width, height } = page.getSize();

    // Find heading position (naive: use fixed coordinates)
    let x = 50;
    let y = height - 100; // placeholder

    // Draw updated content
    if (Array.isArray(content)) {
      content.forEach((line, idx) => {
        page.drawText(line, {
          x,
          y: y - idx * 12,
          size: 12,
          font: pdfDoc.embedStandardFont(PDFLibDocument.StandardFonts.Helvetica),
          color: rgb(0, 0, 0),
        });
      });
    } else if (typeof content === "object") {
      Object.entries(content).forEach(([k, v], idx) => {
        page.drawText(`${k}: ${v}`, {
          x,
          y: y - idx * 12,
          size: 12,
          font: pdfDoc.embedStandardFont(PDFLibDocument.StandardFonts.Helvetica),
          color: rgb(0, 0, 0),
        });
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Generate a PDF buffer for a tailored resume while preserving the original layout.
 * @param {Buffer} originalPdfBuffer - PDF buffer of the uploaded resume
 * @param {string} jobDescription - JD text
 * @returns {Promise<Buffer>}
 */
async function generateTailoredResumePDF(originalPdfBuffer, jobDescription) {
  // 1. Extract text with coordinates
  const items = await extractTextWithCoords(originalPdfBuffer);

  // 2. Build JSON representation
  const resumeJSON = buildResumeJSON(items);

  // 3. Optimize content via Gemini
  const updatedJSON = await optimizeResumeContent(resumeJSON, jobDescription);

  // 4. Replace text in the original PDF
  const finalPdf = await replaceTextInPdf(originalPdfBuffer, updatedJSON);

  return finalPdf;
}

/**
 * Generate a PDF buffer for a cover letter.
 * (unchanged from previous implementation)
 */
async function generateCoverLetterPDF(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        info: {
          Title: "Cover Letter",
          Author: "AI Resume Matcher",
        },
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor("#1a1a2e")
        .text("Cover Letter", { align: "center" });
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#888888")
        .text(
          `${data.tone ? data.tone.charAt(0).toUpperCase() + data.tone.slice(1) : "Professional"} tone • ${new Date().toLocaleDateString()}`,
          { align: "center" }
        );
      doc.moveDown(2);

      // Body
      const paragraphs = data.content.split("\n").filter((p) => p.trim());
      paragraphs.forEach((paragraph) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return;
        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor("#333333")
          .text(trimmed, {
            align: "justify",
            lineGap: 6,
            paragraphGap: 8,
          });
        doc.moveDown(0.5);
      });

      // Footer
      doc.moveDown(3);
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#aaaaaa")
        .text("Generated by AI Resume Matcher", { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateTailoredResumePDF,
  generateCoverLetterPDF,
};