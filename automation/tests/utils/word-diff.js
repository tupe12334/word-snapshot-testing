import fs from "fs";
import path from "path";
const { XMLParser } = require("fast-xml-parser");
const AdmZip = require("adm-zip");

/**
 * Extracts the XML content from a Word document (.docx file)
 * @param {string} filePath - Path to the .docx file
 * @returns {string} The XML content of the document
 */
function getDocXml(filePath) {
  const zip = new AdmZip(filePath);
  const entry = zip.getEntry("word/document.xml");
  return entry.getData().toString("utf8");
}

/**
 * Parses XML string and strips date information for consistent comparison
 * @param {string} xmlStr - The XML string to parse
 * @returns {Object} Parsed JSON object with dates removed
 */
function parseAndStripDates(xmlStr) {
  const parser = new XMLParser({ ignoreAttributes: false });
  const json = parser.parse(xmlStr);

  const jsonStr = JSON.stringify(json).replace(/\d{4}-\d{2}-\d{2}/g, ""); // remove ISO dates
  return JSON.parse(jsonStr);
}

/**
 * Compares a Word document with a snapshot file
 * @param {string} documentPath - Path to the Word document to compare
 * @param {string} snapshotPath - Path to the snapshot file
 * @returns {Object} Result object with success status and content
 */
function compareWithSnapshot(documentPath, snapshotPath) {
  // Extract and parse the Word document XML content
  const xmlContent = getDocXml(documentPath);
  const parsedContent = parseAndStripDates(xmlContent);
  const contentSnapshot = JSON.stringify(parsedContent, null, 2);

  // Ensure snapshots directory exists
  const snapshotDir = path.dirname(snapshotPath);
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  if (!fs.existsSync(snapshotPath)) {
    // First run - create the snapshot
    fs.writeFileSync(snapshotPath, contentSnapshot);
    return {
      success: true,
      isNewSnapshot: true,
      message: `Created initial snapshot at: ${snapshotPath}`,
      content: contentSnapshot,
    };
  } else {
    // Compare with existing snapshot
    const existingSnapshot = fs.readFileSync(snapshotPath, "utf8");
    const matches = contentSnapshot === existingSnapshot;

    return {
      success: matches,
      isNewSnapshot: false,
      message: matches
        ? "Word document content matches snapshot!"
        : "Word document content does not match snapshot",
      content: contentSnapshot,
      expectedContent: existingSnapshot,
    };
  }
}

export { getDocXml, parseAndStripDates, compareWithSnapshot };
