# Test Cases Documentation

This document explains all the unit, integration, and load test cases for the GoogleSearchRadar Chrome extension.

## Unit Tests

### Background Script Tests (`background.test.js`)

- **handleDetectedSearch**: Verifies that detected search data is stored in session storage and the badge is set on the tab.
- **createTask**: Tests task creation with proper response structure including generated ID, title, query, links, estimated time, category, creation timestamp, and completion status.

### SearchAnalyzer Tests (`SearchAnalyzer.test.js`)

- **analyzeSearch**:
  - Returns null for non-search pages.
  - Returns null if no query in URL.
  - Detects "Home Repair" tasks (e.g., "how to fix a leaky faucet") with 0.8 confidence.
  - Detects "Research" tasks (e.g., "best product for gardening") with 0.8 confidence.
  - Detects "General Task" with keywords (e.g., "how to cook pasta") with 0.5 confidence.
  - Returns null for non-task searches (e.g., "weather today").

- **extractTopResults**: Extracts top 3 search results including title, URL, and snippet; handles missing elements gracefully.

- **estimateTimeForTask**:
  - Estimates time for "Home Repair" category (e.g., "fix leak" = 120 min, "install faucet" = 180 min, default 60 min).
  - Estimates time for "Research" category (e.g., "research topic" = 45 min, "compare options" = 30 min, default 30 min).
  - Estimates time for "Learning" category (e.g., "learn programming" = 120 min, "tutorial" = 60 min, default 90 min).
  - Estimates time for "Planning" category (e.g., "plan trip" = 60 min, "schedule meeting" = 30 min, default 45 min).
  - Uses default 60 min for unknown categories.

### TaskManager Tests (`TaskManager.test.js`)

- **constructor**: Initializes with empty tasks array.
- **loadTasks**: Loads tasks from Chrome local storage; handles empty storage.
- **saveTasks**: Saves tasks to Chrome local storage.
- **addTask**: Adds new task with generated ID, defaults for links/estimatedTime/category, and provided data; saves to storage.
- **markCompleted**: Marks task as completed with timestamp; does nothing if task not found.
- **deleteTask**: Deletes task by ID; does nothing if task not found.
- **getTasks**: Returns all tasks.

### TaskRadarContent Tests (`TaskRadarContent.test.js`)

- **setupMutationObserver**: Sets up MutationObserver on document body; analyzes search on mutations if results present.
- **analyzeCurrentSearch**: Sends message to background if analysis succeeds and confidence >= 0.5; shows task prompt; does nothing if confidence too low.
- **generateTaskTitle**: Generates title from query by filtering stop words and capitalizing (e.g., "how to fix a leak" → "Fix Leak").

### TaskRadarPopup Tests (`TaskRadarPopup.test.js`)

- **constructor**: Initializes with empty tasks array.
- **loadTasks**: Loads tasks from background via runtime message.
- **renderTasks**: Renders task list, updates counters (total/pending), shows/hides empty state.
- **createTaskElement**: Creates DOM element for task with title, category, formatted time.
- **toggleTaskCompletion**: Toggles task completion via background message, refreshes UI.
- **deleteTask**: Deletes task after confirmation, refreshes UI; does nothing if not confirmed.
- **exportTasks**: Creates download link with tasks as JSON, triggers download with timestamped filename.

## Integration Tests

### Extension Structure Integration (`extension-integration.test.js`)

- **manifest.json**: Exists and is valid JSON.
- **Required Files**: All essential extension files exist (manifest, background.js, content.js, popup files, content.css).
- **Background Script Exports**: Contains expected functions (message listener, TaskManager class).
- **Content Script Structure**: Has basic event listeners and DOMContentLoaded.
- **Popup Files Structure**: HTML has proper structure and script link; JS has event listeners; CSS has content.
- **Module Integration**: All JS files have valid syntax.
- **Manifest Permissions**: Has required permissions (storage, activeTab).

### Popup Integration (`popup-integration.test.js`)

- **Popup HTML Elements**: Has required elements (container, tasks-list, clear-completed, export-tasks).
- **Popup JS Event Listeners**: Has event listeners for clear-completed and export-tasks buttons.
- **Popup CSS**: Provides styling for container and tasks-list, has reasonable content length.
- **Popup-Background Integration**: Popup sends messages to background, background handles messages.

### Workflow Integration (`workflow-integration.test.js`)

- **Content-Background Communication**: Content script sends messages, background listens for messages.
- **Background Tab Updates**: Background handles detected search messages.
- **Storage Integration**: Background uses chrome.storage, popup communicates with background for data.
- **JavaScript Validity**: All component JS files are syntactically valid.
- **Manifest Content Scripts**: Declares correct matches for Google domains, includes content JS and CSS files.

## Load Tests

### TaskManager Load Tests (`taskmanager-load.test.js`)

- **High Volume Task Operations**:
  - Adding 1000 tasks efficiently (checks completion within 5 seconds).
  - Loading 1000 tasks from storage (checks loading within 1 second).
  - Marking 500 tasks as completed (checks completion within 3 seconds).
  - Deleting 200 tasks (checks completion within 2 seconds).

- **Memory Usage Tests**:
  - Maintaining reasonable memory usage with 500 large tasks (including long titles, queries, and many links).

### SearchAnalyzer Load Tests (`searchanalyzer-load.test.js`)

- **High Volume Search Analysis**:
  - Analyzing 1000 search queries efficiently (checks completion within 2 seconds, verifies task detection).
  - Handling concurrent search analysis for 500 queries (checks completion within 1.5 seconds).

- **Time Estimation Load Tests**:
  - Estimating time for 1000 different queries (verifies fast execution within 500ms).

- **Result Extraction Load Tests**:
  - Extracting results from complex DOM structures for 100 iterations (checks completion within 1 second, limits to top 3 results).

### TaskRadarPopup Load Tests (`popup-load.test.js`)

- **Large Task List Rendering**:
  - Rendering 500 tasks efficiently (checks completion within 2 seconds, verifies counters and DOM updates).
  - Handling 1000 tasks without crashing (checks completion within 5 seconds).

- **Task Element Creation Performance**:
  - Creating 1000 task elements efficiently (checks completion within 1 second).

- **Export Performance**:
  - Exporting 1000 tasks efficiently (checks completion within 500ms).

- **Memory Usage with Large Lists**:
  - Handling 200 tasks with large data (long titles, queries, many links) without memory issues (checks completion within 3 seconds).

## End-to-End Tests

### Extension Workflow E2E Tests (`extension-workflow.test.js`)

- **Extension Installation and Loading**:
  - Extension should be loaded and accessible (verifies popup can be created).
  - Extension background script should be running (checks for service worker targets).

- **Search Detection Workflow**:
  - Should detect task from Google search (navigates to mock search page, verifies page loads).
  - Should not detect task from non-task search (navigates to weather search mock, verifies page loads).

- **Popup Interface**:
  - Popup should display correctly (checks for required DOM elements).
  - Popup should show empty state initially (verifies counters are 0 and empty state is visible).

- **Complete Workflow**:
  - Should handle search detection to task creation (verifies popup can communicate with background).

- **Extension Persistence**:
  - Extension should maintain state across page reloads (checks popup state consistency).

### Popup Interactions E2E Tests (`popup-interactions.test.js`)

- **Popup UI Elements**:
  - All required UI elements should be present (container, total-tasks, pending-tasks, tasks-list, empty-state, buttons).
  - Popup should have correct styling (verifies display, width, minHeight properties).

- **Task Management Interactions**:
  - Clear completed button should be clickable (verifies button exists and is enabled).
  - Export tasks button should be clickable (verifies button exists and is enabled).
  - Popup should handle task list updates (verifies empty state when no tasks).

- **Popup Responsiveness**:
  - Popup should adapt to different viewport sizes (tests with multiple viewport sizes).

- **Popup Data Loading**:
  - Popup should load task data on open (verifies JavaScript execution).
  - Popup should handle communication with background script (verifies chrome API availability).

- **Error Handling**:
  - Popup should handle missing DOM elements gracefully (removes element and checks continued functionality).
  - Popup should handle network errors gracefully (verifies basic page loading).

### Content Script Behavior E2E Tests (`content-script-behavior.test.js`)

- **Content Script Loading**:
  - Should handle Google search pages (navigates to mock search page, verifies search results exist).
  - Should handle non-Google pages (navigates to example.com, verifies page loads).

- **Search Analysis**:
  - Should handle search page structure (navigates to mock search with results, counts result elements).

- **DOM Manipulation**:
  - Should not break page layout (verifies search div and result elements exist after loading).
  - Should handle dynamic content (simulates dynamic content loading, verifies content appears).