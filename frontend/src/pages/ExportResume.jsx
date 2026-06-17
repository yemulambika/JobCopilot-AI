import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";

const ExportResume = () => {
  const [resumeText, setResumeText] = useState("");

  const exportPDF = () => {
    const doc = new jsPDF();
    const lines = resumeText.split("\n");
    let y = 10;
    lines.forEach((line) => {
      doc.text(line, 10, y);
      y += 7;
    });
    doc.save("resume.pdf");
  };

  const exportDOCX = async () => {
    const doc = new Document();
    const lines = resumeText.split("\n");
    lines.forEach((line) => {
      doc.addSection({
        children: [new Paragraph(new TextRun(line))],
      });
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.docx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportTXT = () => {
    const blob = new Blob([resumeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Export Resume</h2>

      <textarea
        placeholder="Paste your resume text here..."
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        rows={12}
        className="border p-2 rounded w-full mb-4"
      />

      <div className="flex gap-4">
        <button
          onClick={exportPDF}
          className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
        >
          Export PDF
        </button>
        <button
          onClick={exportDOCX}
          className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
        >
          Export DOCX
        </button>
        <button
          onClick={exportTXT}
          className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
        >
          Export TXT
        </button>
      </div>
    </div>
  );
};

export default ExportResume;