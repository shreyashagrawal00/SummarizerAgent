import pdf from "pdf-parse";
import fs from "fs";

const testPdf = async () => {
  try {
    // We don't have a real PDF here to test easily without uploading, 
    // but we can check if the module loads and if it can handle an empty buffer
    const buffer = Buffer.from([]);
    try {
      await pdf(buffer);
    } catch (e) {
      console.log("pdf-parse error (expected for empty buffer):", e.message);
    }
    console.log("pdf-parse module loaded successfully");
  } catch (err) {
    console.error("pdf-parse load failed:", err);
  }
};

testPdf();
