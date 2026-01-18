# Task Radar MVP

Detects tasks from your Google searches and helps you track them.

## Overview

Task Radar is a small Chrome/Chromium extension (MV3) that injects a content script into Google search pages to detect task-like queries, provides a popup UI, and uses a background service worker for coordination and storage.

Key components:
- `manifest.json` — extension metadata and permissions
- `content.js` / `content.css` — injected into Google search pages
- `background.js` — service worker
- `popup/` — popup UI (`popup.html`, `popup.js`, `popup.css`)
- `icons/` — extension icons

## Install (developer / local)

1. Open Chrome (or another Chromium-based browser).
2. Go to `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the repository root folder.
4. The extension should appear in your toolbar; click it to open the popup.

Notes:
- After making code changes, click **Reload** on the extension page to pick up updates.

## Usage

- Visit Google search pages (the extension matches `*.google.com`, `*.google.co.uk`, `*.google.ca`, `*.google.com.au`).
- Task Radar's content script runs on those pages to detect and surface tasks found in your searches.
- Click the toolbar icon (or the popup) to view tracked tasks and quick actions.

## Development

- Edit source files directly in this folder and reload the unpacked extension.
- Background logic runs in the MV3 service worker (`background.js`). Use the Extensions page to inspect service worker logs and lifecycle.
- Content behavior is in `content.js` and styling in `content.css`.

Project structure (root):

```
background.js
content.css
content.js
manifest.json
icons/
popup/
  popup.css
  popup.html
  popup.js
```

## Testing

Unit tests are implemented using Jest with jsdom for DOM simulation. The test suite covers core functionality with comprehensive mocking of Chrome APIs and browser environments.

### Test Setup
- **Framework**: Jest with jsdom environment
- **Configuration**: ES module support, coverage reporting
- **Mocking**: Chrome extension APIs (storage, runtime, action), DOM methods, MutationObserver

### Coverage
- **Overall**: 66.52% statements, 76.1% branches, 59.64% functions, 66.66% lines
- **Key Modules**:
  - TaskManager: 100% (CRUD operations, validation)
  - SearchAnalyzer: 100% (query analysis, categorization)
  - Background script: 67.5% (message handling)
  - Content script: 63.15% (search detection, UI)
  - Popup script: 70.88% (task rendering, export)

### Running Tests
```bash
npm install
npm run test          # Run all tests
npm run test:coverage # Run tests with coverage report
```

### Test Files
- `tests/unit/setup.js` — Global mocks and configuration
- `tests/unit/TaskManager.test.js` — Task management logic
- `tests/unit/SearchAnalyzer.test.js` — Search analysis algorithms
- `tests/unit/TaskRadarContent.test.js` — Content script functionality
- `tests/unit/TaskRadarPopup.test.js` — Popup interface
- `tests/unit/background.test.js` — Background script message handling

## Manifest

This extension uses Manifest V3. Primary permissions declared in `manifest.json` include `storage`, `activeTab`, and `scripting`, and host permissions for Google domains.

## Contributing

Feel free to open issues or submit pull requests. For larger changes, open an issue first to discuss the design.

## License

No license specified. Add a `LICENSE` file to clarify usage rights.

---
Generated from the repository manifest and source layout.
