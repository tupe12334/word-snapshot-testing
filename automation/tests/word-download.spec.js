import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Word Document Download', () => {
  test('should download word document when button is clicked', async ({ page }) => {
    // Set up download handling
    const downloadsPath = path.join(__dirname, '..', 'downloads');
    
    // Ensure downloads directory exists
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true });
    }

    // Navigate to the HTML page
    await page.goto('index.html');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Verify the page loaded correctly
    await expect(page.locator('h1')).toHaveText('Word Document Generator');
    await expect(page.locator('#downloadBtn')).toBeVisible();

    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');

    // Click the download button
    await page.click('#downloadBtn');

    // Wait for button text to change to "Generating..."
    await expect(page.locator('#downloadBtn')).toHaveText('Generating...');

    // Wait for the download to complete
    const download = await downloadPromise;

    // Verify the download
    expect(download.suggestedFilename()).toBe('empty-document.docx');

    // Save the downloaded file
    const downloadPath = path.join(downloadsPath, download.suggestedFilename());
    await download.saveAs(downloadPath);

    // Verify the file was saved
    expect(fs.existsSync(downloadPath)).toBe(true);

    // Verify file size is greater than 0 (Word documents have a minimum size)
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(0);

    // Verify button text returns to normal
    await expect(page.locator('#downloadBtn')).toHaveText('Download Empty Word Document');

    console.log(`Downloaded file saved to: ${downloadPath}`);
    console.log(`File size: ${stats.size} bytes`);
  });

  test('should handle multiple downloads', async ({ page }) => {
    const downloadsPath = path.join(__dirname, '..', 'downloads');
    
    // Navigate to the HTML page
    await page.goto('index.html');
    await page.waitForLoadState('networkidle');

    // Download multiple files
    for (let i = 1; i <= 3; i++) {
      const downloadPromise = page.waitForEvent('download');
      
      await page.click('#downloadBtn');
      
      const download = await downloadPromise;
      const filename = `empty-document-${i}.docx`;
      const downloadPath = path.join(downloadsPath, filename);
      
      await download.saveAs(downloadPath);
      
      // Verify each file was created
      expect(fs.existsSync(downloadPath)).toBe(true);
      
      console.log(`Download ${i} completed: ${downloadPath}`);
      
      // Wait a bit between downloads
      await page.waitForTimeout(1000);
    }
  });

  test('should verify page elements before download', async ({ page }) => {
    await page.goto('index.html');
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page).toHaveTitle('Word Document Generator');

    // Check main heading
    await expect(page.locator('h1')).toHaveText('Word Document Generator');

    // Check description text
    await expect(page.locator('p')).toContainText('Click the button below to download an empty Word document');

    // Check button is present and enabled
    const downloadBtn = page.locator('#downloadBtn');
    await expect(downloadBtn).toBeVisible();
    await expect(downloadBtn).toBeEnabled();
    await expect(downloadBtn).toHaveText('Download Empty Word Document');

    // Verify required scripts are loaded
    const fileServerScript = page.locator('script[src*="FileSaver"]');
    const docxScript = page.locator('script[src*="docx"]');
    
    await expect(fileServerScript).toBeAttached();
    await expect(docxScript).toBeAttached();
  });
});
