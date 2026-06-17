const fs = require("fs");
const path = require("path");
const pdfjsLib = require("pdfjs-dist");
const mammoth = require("mammoth");

/**
 * Extract text from a PDF file.
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function extractPdfText(filePath) {
  const dataBuffer = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjsLib.getDocument({ data: dataBuffer }).promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    text += strings.join(" ");
  }

  return text;
}

/**
 * Extract text from a DOCX file.
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function extractDocxText(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

/**
 * Determine file type and extract text.
 * @param {string} filePath
 * @param {string} mimeType
 * @returns {Promise<string>}
 */
async function extractText(filePath, mimeType) {
  if (mimeType === "application/pdf") {
    return extractPdfText(filePath);
  }
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractDocxText(filePath);
  }
  throw new Error(`Unsupported file type: ${mimeType}`);
}

module.exports = { extractPdfText, extractDocxText, extractText };