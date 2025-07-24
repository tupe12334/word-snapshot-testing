import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Word Document Download", () => {
  test("should download word document and match snapshot", async ({ page }) => {
    // Set up download handling
    const downloadsPath = path.join(__dirname, "..", "downloads");

    // Ensure downloads directory exists
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true });
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
    const downloadPath = path.join(downloadsPath, "test-document.docx");
    await download.saveAs(downloadPath);

    // Verify the file was saved
    expect(fs.existsSync(downloadPath)).toBe(true);

    // Verify file size is greater than 0 (Word documents have a minimum size)
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(0);

    // Read the downloaded file for snapshot comparison
    const downloadedFile = fs.readFileSync(downloadPath);

    // Perform snapshot testing on the binary content
    expect(downloadedFile).toMatchSnapshot("word-document.docx");

    // Verify button text returns to normal
    await expect(page.locator("#downloadBtn")).toHaveText(
      "Download Empty Word Document"
    );

    console.log(`Downloaded file saved to: ${downloadPath}`);
    console.log(`File size: ${stats.size} bytes`);
  });
});
