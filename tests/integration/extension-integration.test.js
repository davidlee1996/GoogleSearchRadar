/**
 * Integration tests for GoogleSearchRadar Chrome extension
 * These tests validate the overall structure and module integration
 */

const fs = require('fs');
const path = require('path');

describe('Extension Structure Integration', () => {
  test('manifest.json exists and is valid JSON', () => {
    const manifestPath = path.join(__dirname, '../../src/manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    expect(() => JSON.parse(manifestContent)).not.toThrow();
  });

  test('all required extension files exist', () => {
    const requiredFiles = [
      'src/manifest.json',
      'src/background/background.js',
      'src/content/content.js',
      'src/popup/popup.html',
      'src/popup/popup.js',
      'src/popup/popup.css',
      'src/content/content.css'
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, '../..', file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('background script exports expected functions', () => {
    const backgroundPath = path.join(__dirname, '../../src/background/background.js');
    const backgroundCode = fs.readFileSync(backgroundPath, 'utf8');

    // Check for key function definitions (basic validation)
    expect(backgroundCode).toMatch(/chrome\.runtime\.onMessage/);
    expect(backgroundCode).toMatch(/class TaskManager/);
  });

  test('content script has basic structure', () => {
    const contentPath = path.join(__dirname, '../../src/content/content.js');
    const contentCode = fs.readFileSync(contentPath, 'utf8');

    // Check for basic content script patterns
    expect(contentCode).toMatch(/document\.addEventListener/);
    expect(contentCode).toMatch(/DOMContentLoaded/);
  });

  test('popup files are properly structured', () => {
    const popupHtmlPath = path.join(__dirname, '../../src/popup/popup.html');
    const popupJsPath = path.join(__dirname, '../../src/popup/popup.js');
    const popupCssPath = path.join(__dirname, '../../src/popup/popup.css');

    const htmlContent = fs.readFileSync(popupHtmlPath, 'utf8');
    const jsContent = fs.readFileSync(popupJsPath, 'utf8');
    const cssContent = fs.readFileSync(popupCssPath, 'utf8');

    // Check HTML structure
    expect(htmlContent).toMatch(/<html/);
    expect(htmlContent).toMatch(/<body/);
    expect(htmlContent).toMatch(/popup\.js/);

    // Check JS structure
    expect(jsContent).toMatch(/document\.addEventListener/);
    expect(jsContent).toMatch(/DOMContentLoaded/);

    // Check CSS exists and has content
    expect(cssContent.length).toBeGreaterThan(0);
  });
});

describe('Module Integration', () => {
  test('all modules can be required without errors', () => {
    // This test validates that all JS files are syntactically correct
    const jsFiles = [
      'src/background.js',
      'src/content.js',
      'src/popup/popup.js'
    ];

    jsFiles.forEach(file => {
      const filePath = path.join(__dirname, '../..', file);
      expect(() => {
        // Basic syntax check by attempting to create a new Function
        const code = fs.readFileSync(filePath, 'utf8');
        new Function(code);
      }).not.toThrow(`File ${file} should have valid JavaScript syntax`);
    });
  });

  test('manifest permissions are reasonable', () => {
    const manifestPath = path.join(__dirname, '../../src/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    expect(manifest.permissions).toBeDefined();
    expect(Array.isArray(manifest.permissions)).toBe(true);

    // Check for expected permissions
    const expectedPermissions = ['storage', 'activeTab'];
    expectedPermissions.forEach(perm => {
      expect(manifest.permissions).toContain(perm);
    });
  });
});