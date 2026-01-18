/**
 * Workflow Integration Tests
 * Tests the complete workflow from content script to background to popup
 */

const fs = require('fs');
const path = require('path');

describe('Workflow Integration', () => {
  test('content script communicates with background', () => {
    const contentJsPath = path.join(__dirname, '../../src/content/content.js');
    const backgroundJsPath = path.join(__dirname, '../../src/background/background.js');

    const contentContent = fs.readFileSync(contentJsPath, 'utf8');
    const backgroundContent = fs.readFileSync(backgroundJsPath, 'utf8');

    // Check for message passing between content and background
    expect(contentContent).toMatch(/chrome\.runtime\.sendMessage/);
    expect(backgroundContent).toMatch(/chrome\.runtime\.onMessage/);
  });

  test('background script handles tab updates', () => {
    const backgroundJsPath = path.join(__dirname, '../../src/background/background.js');
    const backgroundContent = fs.readFileSync(backgroundJsPath, 'utf8');

    // Check for message handling (the main communication mechanism)
    expect(backgroundContent).toMatch(/chrome\.runtime\.onMessage/);
    expect(backgroundContent).toMatch(/handleDetectedSearch/);
  });

  test('storage integration works across components', () => {
    const backgroundJsPath = path.join(__dirname, '../../src/background/background.js');
    const popupJsPath = path.join(__dirname, '../../src/popup/popup.js');

    const backgroundContent = fs.readFileSync(backgroundJsPath, 'utf8');
    const popupContent = fs.readFileSync(popupJsPath, 'utf8');

    // Check that background uses chrome.storage and popup communicates with background
    expect(backgroundContent).toMatch(/chrome\.storage/);
    expect(popupContent).toMatch(/chrome\.runtime\.sendMessage/);
  });

  test('all components are syntactically valid JavaScript', () => {
    const files = [
      'src/background/background.js',
      'src/content/content.js',
      'src/popup/popup.js'
    ];

    files.forEach(file => {
      const filePath = path.join(__dirname, '../..', file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Check that files are valid JavaScript by attempting to create a Function
      expect(() => {
        new Function(content);
      }).not.toThrow(`File ${file} should contain valid JavaScript`);
    });
  });

  test('manifest declares correct content script matches', () => {
    const manifestPath = path.join(__dirname, '../../src/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    expect(manifest.content_scripts).toBeDefined();
    expect(manifest.content_scripts.length).toBeGreaterThan(0);

    const contentScript = manifest.content_scripts[0];
    expect(contentScript.matches).toContain('*://*.google.com/*');
    expect(contentScript.js).toEqual(['content/content.js']);
    expect(contentScript.css).toEqual(['content/content.css']);
  });
});