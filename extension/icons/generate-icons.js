/**
 * Run: node generate-icons.js
 * Creates simple PNG icons from SVG for Chrome extension.
 * Alternatively, replace these with actual .png files of the specified sizes.
 */

const fs = require("fs");
const path = require("path");

// Create SVG icon at runtime (since we can't use canvas easily)
// These are placeholder SVG icons. For production, replace with actual PNG files.

const svgTemplate = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0f172a"/>
  <circle cx="${size * 0.5}" cy="${size * 0.45}" r="${size * 0.22}" fill="none" stroke="#22d3ee" stroke-width="${size * 0.04}"/>
  <line x1="${size * 0.3}" y1="${size * 0.65}" x2="${size * 0.7}" y2="${size * 0.65}" stroke="#22d3ee" stroke-width="${size * 0.04}" stroke-linecap="round"/>
  <line x1="${size * 0.35}" y1="${size * 0.75}" x2="${size * 0.65}" y2="${size * 0.75}" stroke="#06b6d4" stroke-width="${size * 0.03}" stroke-linecap="round"/>
  <line x1="${size * 0.38}" y1="${size * 0.83}" x2="${size * 0.62}" y2="${size * 0.83}" stroke="#06b6d4" stroke-width="${size * 0.025}" stroke-linecap="round"/>
</svg>`;

const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, "");

sizes.forEach((size) => {
  const svg = svgTemplate(size);
  const svgPath = path.join(iconsDir, `icon${size}.svg`);
  const pngPath = path.join(iconsDir, `icon${size}.png`);

  fs.writeFileSync(svgPath, svg);
  // Create a minimal valid PNG from SVG (in production, use sharp/puppeteer)
  // For now, create the SVG file and note that users should convert to PNG
  console.log(`Created ${svgPath}`);
});

console.log("\nSVG icons generated! Convert them to PNG using:");
console.log("  Option 1: Use https://convertio.co/svg-png/");
console.log("  Option 2: Use sharp (npm i sharp)");
console.log("\nFor Chrome extension, PNG format is required.");