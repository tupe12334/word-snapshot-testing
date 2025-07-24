import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";
import { compareWithSnapshot } from "./utils/word-diff.js";

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

    // Compare Word document content with snapshot
    const snapshotPath = path.join(snapshotsPath, "word-document-content.json");
    const comparisonResult = compareWithSnapshot(downloadPath, snapshotPath);

    // Assert the comparison result
    expect(comparisonResult.success).toBe(true);
    console.log(comparisonResult.message);

    // Verify button text returns to normal
    await expect(page.locator("#downloadBtn")).toHaveText(
      "Download Empty Word Document"
    );

    console.log(`Downloaded file saved to: ${downloadPath}`);
    console.log(`File size: ${stats.size} bytes`);
  });
});
