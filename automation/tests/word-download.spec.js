import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";
const { XMLParser } = require("fast-xml-parser");
const AdmZip = require("adm-zip");

function getDocXml(filePath) {
  const zip = new AdmZip(filePath);
  const entry = zip.getEntry("word/document.xml");
  return entry.getData().toString("utf8");
}

function parseAndStripDates(xmlStr) {
  const parser = new XMLParser({ ignoreAttributes: false });
  const json = parser.parse(xmlStr);

  const jsonStr = JSON.stringify(json).replace(/\d{4}-\d{2}-\d{2}/g, ""); // remove ISO dates
  return JSON.parse(jsonStr);
}

test.describe("Word Document Download", () => {
  test("should download word document and match content snapshot", async ({
    page,
  }) => {
    // Set up download handling
    const downloadsPath = path.join(__dirname, "..", "downloads");
    const snapshotsPath = path.join(__dirname, "snapshots"); // Move snapshots to tests/snapshots

    // Ensure directories exist
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true });
    }
    if (!fs.existsSync(snapshotsPath)) {
      fs.mkdirSync(snapshotsPath, { recursive: true });
    }

    // Navigate to the HTML page
    await page.goto("index.html");

    // Wait for the page to load completely
    await page.waitForLoadState("networkidle");

    // Verify the page loaded correctly
    await expect(page.locator("h1")).toHaveText("Word Document Generator");
    await expect(page.locator("#downloadBtn")).toBeVisible();

    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent("download");

    // Click the download button
    await page.click("#downloadBtn");

    // Wait for button text to change to "Generating..."
    await expect(page.locator("#downloadBtn")).toHaveText("Generating...");

    // Wait for the download to complete
    const download = await downloadPromise;

    // Verify the download
    expect(download.suggestedFilename()).toBe("empty-document.docx");

    // Save the downloaded file
    const downloadPath = path.join(downloadsPath, "test-download.docx");
    await download.saveAs(downloadPath);

    // Verify the file was saved
    expect(fs.existsSync(downloadPath)).toBe(true);

    // Verify file size is greater than 0 (Word documents have a minimum size)
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(0);

    // Extract and parse the Word document XML content
    const xmlContent = getDocXml(downloadPath);
    const parsedContent = parseAndStripDates(xmlContent);
    const contentSnapshot = JSON.stringify(parsedContent, null, 2);

    // Snapshot testing logic
    const snapshotPath = path.join(snapshotsPath, "word-document-content.json");

    if (!fs.existsSync(snapshotPath)) {
      // First run - create the snapshot
      fs.writeFileSync(snapshotPath, contentSnapshot);
      console.log("Created initial snapshot at:", snapshotPath);
    } else {
      // Compare with existing snapshot
      const existingSnapshot = fs.readFileSync(snapshotPath, "utf8");
      expect(contentSnapshot).toBe(existingSnapshot);
      console.log("Word document content matches snapshot!");
    }

    // Verify button text returns to normal
    await expect(page.locator("#downloadBtn")).toHaveText(
      "Download Empty Word Document"
    );

    console.log(`Downloaded file saved to: ${downloadPath}`);
    console.log(`File size: ${stats.size} bytes`);
  });
});
