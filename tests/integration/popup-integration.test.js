/**
 * Popup Integration Tests
 * Tests the popup UI functionality and integration
 */

const fs = require('fs');
const path = require('path');

describe('Popup Integration', () => {
  test('popup HTML has required elements', () => {
    const popupHtmlPath = path.join(__dirname, '../../src/popup/popup.html');
    const htmlContent = fs.readFileSync(popupHtmlPath, 'utf8');

    // Check for essential HTML elements that actually exist
    expect(htmlContent).toMatch(/<div class="container"/);
    expect(htmlContent).toMatch(/id="tasks-list"/);
    expect(htmlContent).toMatch(/id="clear-completed"/);
    expect(htmlContent).toMatch(/id="export-tasks"/);
  });

  test('popup JavaScript has event listeners', () => {
    const popupJsPath = path.join(__dirname, '../../src/popup/popup.js');
    const jsContent = fs.readFileSync(popupJsPath, 'utf8');

    // Check for event listeners that actually exist
    expect(jsContent).toMatch(/document\.getElementById\('clear-completed'\)/);
    expect(jsContent).toMatch(/document\.getElementById\('export-tasks'\)/);
    expect(jsContent).toMatch(/addEventListener\('click'/);
  });

  test('popup CSS provides styling', () => {
    const popupCssPath = path.join(__dirname, '../../src/popup/popup.css');
    const cssContent = fs.readFileSync(popupCssPath, 'utf8');

    // Check for basic CSS rules that actually exist
    expect(cssContent).toMatch(/\.container/);
    expect(cssContent).toMatch(/\.tasks-list/);
    expect(cssContent.length).toBeGreaterThan(100); // Reasonable minimum size
  });

  test('popup integrates with background script functions', () => {
    const popupJsPath = path.join(__dirname, '../../src/popup/popup.js');
    const backgroundJsPath = path.join(__dirname, '../../src/background/background.js');

    const popupContent = fs.readFileSync(popupJsPath, 'utf8');
    const backgroundContent = fs.readFileSync(backgroundJsPath, 'utf8');

    // Check that popup calls background functions
    expect(popupContent).toMatch(/chrome\.runtime\.sendMessage/);
    expect(backgroundContent).toMatch(/chrome\.runtime\.onMessage/);
  });
});