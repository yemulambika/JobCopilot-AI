const fs = require("fs");
const pdfjsLib = require("pdfjs-dist");

/**
 * Extract text content from a PDF file.
 * @param {string} filePath - Absolute path to the PDF file.
 * @returns {Promise<string>} Extracted text.
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

module.exports = { extractPdfText };