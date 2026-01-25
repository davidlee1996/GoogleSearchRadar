# Source Code Overview

This directory contains the core source code for the Task Radar Chrome extension. The extension is built using Manifest V3 and consists of several key components that work together to detect tasks from Google searches and provide a user interface for tracking them.

## Directory Structure

```
src/
├── manifest.json          # Extension manifest and configuration
├── background/
│   └── background.js      # Service worker for coordination and storage
├── content/
│   ├── content.js         # Content script injected into Google search pages
│   └── content.css        # Styling for content script UI elements
├── popup/
│   ├── popup.html         # Popup interface HTML
│   ├── popup.js           # Popup functionality and event handlers
│   └── popup.css          # Popup styling
└── icons/                 # Extension icons (various sizes)
```

## Components

### Manifest (`manifest.json`)

The extension manifest defines the extension's metadata, permissions, and entry points. Key configurations include:

- **Manifest Version**: V3
- **Permissions**: `storage`, `activeTab`, `scripting`
- **Host Permissions**: Google domains (`*.google.com`, `*.google.co.uk`, etc.)
- **Content Scripts**: Injected into Google search pages
- **Background Service Worker**: Handles extension lifecycle and messaging
- **Action/Popup**: Defines the toolbar popup interface

### Background Service Worker (`background/background.js`)

The background script runs as a service worker and serves as the central coordinator for the extension. Key responsibilities:

- **Message Handling**: Processes messages from content scripts and popup
- **Storage Management**: Persists task data using Chrome's storage API
- **Task Coordination**: Manages task creation, updates, and deletion
- **Extension Lifecycle**: Handles installation, updates, and cleanup

### Content Scripts (`content/`)

The content scripts are injected into Google search result pages to detect and surface tasks.

#### `content.js`
- **Search Detection**: Analyzes search queries and results for task-like content
- **UI Injection**: Adds task detection indicators and quick actions to search pages
- **User Interaction**: Handles clicks and interactions on injected elements
- **Message Passing**: Communicates with the background service worker

#### `content.css`
- **Visual Indicators**: Styles for task detection badges and buttons
- **Responsive Design**: Ensures UI elements work across different screen sizes
- **Google Integration**: Styles that blend with Google's search page design

### Popup Interface (`popup/`)

The popup provides a quick-access interface for viewing and managing detected tasks.

#### `popup.html`
- **Basic Structure**: HTML layout for the popup window
- **Task List Display**: Container for showing tracked tasks
- **Action Buttons**: Quick access to common operations

#### `popup.js`
- **Task Rendering**: Displays tasks in the popup list
- **Event Handling**: Manages user interactions (mark complete, delete, etc.)
- **Data Synchronization**: Fetches and updates task data from storage
- **Export Functionality**: Allows exporting tasks to external formats

#### `popup.css`
- **Layout Styling**: Defines the popup's visual appearance
- **Task Item Styling**: Individual task display formatting
- **Interactive Elements**: Hover states and button styling

### Icons (`icons/`)

Contains the extension's icon files in various sizes (16x16, 32x32, 48x48, 128x128 pixels) for different contexts:

- Browser toolbar
- Extensions page
- Chrome Web Store
- High-DPI displays

## Architecture

The extension follows a modular architecture with clear separation of concerns:

1. **Content Scripts** detect tasks on search pages
2. **Background Service Worker** manages data and coordinates between components
3. **Popup Interface** provides user interaction and task management
4. **Storage API** persists data across browser sessions

## Development Notes

- All scripts use modern JavaScript (ES6+)
- The extension is designed to be lightweight and performant
- Message passing is used for inter-component communication
- Chrome extension APIs are used for storage and UI interactions

## Testing

Corresponding test files are located in the `tests/` directory:
- Unit tests for individual components
- Integration tests for component interactions
- E2E tests for full user workflows

See the main README.md for testing instructions and coverage details.