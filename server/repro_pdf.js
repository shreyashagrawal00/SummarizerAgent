import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

console.log("Type of pdf:", typeof pdf);
console.log("Is pdf callable?", typeof pdf === 'function');
console.log("PDF keys:", Object.keys(pdf || {}));

if (pdf.PDFParse) {
  console.log("Type of pdf.PDFParse:", typeof pdf.PDFParse);
}

// Try to find any function in the object
for (const key in pdf) {
  if (typeof pdf[key] === 'function') {
    console.log(`Found function: ${key}`);
  }
}

// Let's try to see if we can import it differently
try {
  const pdfDirect = require("pdf-parse/lib/pdf-parse.js");
  console.log("Imported from lib/pdf-parse.js successfully");
  console.log("Type of pdfDirect:", typeof pdfDirect);
} catch (e) {
  console.log("Failed to import from lib/pdf-parse.js:", e.message);
}
