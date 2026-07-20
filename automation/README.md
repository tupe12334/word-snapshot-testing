# Word Download Automation

This Playwright project automates the download of Word documents from the HTML page.

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Install Playwright browsers:
   ```bash
   pnpm run install-browsers
   ```

## Running Tests

- Run all tests:

  ```bash
  pnpm test
  ```

- Run tests with browser visible:

  ```bash
  pnpm run test:headed
  ```

- Debug tests:
  ```bash
  pnpm run test:debug
  ```

- Update snapshots:
  ```bash
  pnpm run test:update-snapshots
  ```

## Test Coverage

The test suite includes:

1. **Word Document Download**: Downloads the Word document via the page's download button, verifies the file was saved with content, and compares its extracted content against a stored snapshot (`word-document-content.json`)

## Downloaded Files

Downloaded Word documents are saved to the `downloads/` directory within this automation project.

## Configuration

The Playwright configuration is set up to:

- Use the local HTML file as the base URL
- Run tests in parallel
- Run against Chrome (via the `chromium` project, using the system Chrome channel)
- Generate HTML reports
- Handle file downloads properly

## File Structure

```
automation/
├── package.json
├── playwright.config.ts
├── tests/
│   ├── word-download.spec.ts
│   ├── word-download.spec.ts-snapshots/
│   └── utils/
│       └── word-diff.ts
├── downloads/          # Downloaded files will be saved here
└── README.md
```
