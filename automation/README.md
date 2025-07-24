# Word Download Automation

This Playwright project automates the download of Word documents from the HTML page.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npm run install-browsers
   ```

## Running Tests

- Run all tests:

  ```bash
  npm test
  ```

- Run tests with browser visible:

  ```bash
  npm run test:headed
  ```

- Debug tests:
  ```bash
  npm run test:debug
  ```

## Test Coverage

The test suite includes:

1. **Basic Download Test**: Verifies that clicking the download button successfully downloads a Word document
2. **Multiple Downloads Test**: Tests downloading multiple files in sequence
3. **Page Elements Test**: Verifies all page elements are present and working before attempting download

## Downloaded Files

Downloaded Word documents are saved to the `downloads/` directory within this automation project.

## Configuration

The Playwright configuration is set up to:

- Use the local HTML file as the base URL
- Run tests in parallel
- Support Chrome, Firefox, and Safari
- Generate HTML reports
- Handle file downloads properly

## File Structure

```
automation/
├── package.json
├── playwright.config.js
├── tests/
│   └── word-download.spec.js
├── downloads/          # Downloaded files will be saved here
└── README.md
```
