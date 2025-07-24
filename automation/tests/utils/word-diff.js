import fs from "fs";
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

  // Convert to string and remove various date formats
  let jsonStr = JSON.stringify(json)
    .replace(/\d{4}-\d{2}-\d{2}/g, "") // remove ISO dates (YYYY-MM-DD)
    .replace(
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/g,
      ""
    ) // remove "Month DD, YYYY" format
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, "") // remove MM/DD/YYYY format
    .replace(/\b\d{1,2}-\d{1,2}-\d{4}\b/g, ""); // remove MM-DD-YYYY format

  return JSON.parse(jsonStr);
}

/**
 * Extracts and processes Word document content for snapshot comparison
 * @param {string} documentPath - Path to the Word document
 * @returns {string} Processed content ready for snapshot comparison
 */
function extractWordContentForSnapshot(documentPath) {
  // Extract and parse the Word document XML content
  const xmlContent = getDocXml(documentPath);
  const parsedContent = parseAndStripDates(xmlContent);

  // Return formatted JSON string for consistent snapshot comparison
  return JSON.stringify(parsedContent, null, 2);
}

export { getDocXml, parseAndStripDates, extractWordContentForSnapshot };
