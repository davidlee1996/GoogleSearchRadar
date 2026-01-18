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

## Development Setup

### Prerequisites
- Node.js (version 16 or higher recommended)
- npm (comes with Node.js) or yarn
- Chrome or another Chromium-based browser

### Environment Setup
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd GoogleSearchRadar
   ```

2. **Install Node.js** (if not already installed):
   - Download from [nodejs.org](https://nodejs.org/)
   - Or use a version manager like [nvm](https://github.com/nvm-sh/nvm):
     ```bash
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
     nvm install node
     nvm use node
     ```

3. **Install dependencies**:
   ```bash
   npm install
   ```
   This will install all development and testing dependencies defined in `package.json`.

4. **Verify setup**:
   ```bash
   npm run test
   ```
   This should run the test suite successfully.

### Development Workflow
- **Run all tests**: `npm run test:all`
- **Run unit tests only**: `npm run test:unit`
- **Run integration tests only**: `npm run test:integration`
- **Run tests with coverage**: `npm run test:coverage`
- **Run tests in watch mode**: `npm run test:watch`
- **Lint code** (if configured): `npm run lint`
- **Build for production** (if applicable): `npm run build`

### Docker Setup (Optional)
For isolated development and testing environments without installing Node.js locally, you can use Docker.

**Prerequisites:**
- Docker installed on your system
- docker-compose (usually comes with Docker Desktop)

#### Running Tests with Docker

**Option 1: Using docker-compose (Recommended)**
```bash
# Run all tests
docker-compose run --rm test

# Run tests with coverage report
docker-compose run --rm coverage

# Run tests in watch mode (for development)
docker-compose run --rm test-watch
```

**Option 2: Manual Docker Commands**
```bash
# Build the Docker image (first time only)
docker build -t task-radar .

# Run tests
docker run --rm task-radar npm run test

# Run tests with coverage
docker run --rm task-radar npm run test:coverage

# Run specific test file
docker run --rm task-radar npm test -- tests/unit/TaskManager.test.js
```

#### Docker Development Workflow

**For Active Development:**
```bash
# Run tests in watch mode (re-runs on file changes)
docker-compose run --rm test-watch

# Run tests once
docker-compose run --rm test

# Get coverage report
docker-compose run --rm coverage
```

**Using VS Code Docker Extension:**
1. Install the Docker extension (`ms-azuretools.vscode-docker`)
2. Open Docker Explorer (View → Command Palette → Docker: Show Explorer)
3. Right-click on `docker-compose.yml` → Select service → "Compose Up"
4. View logs and manage containers from the Docker panel

#### Docker Testing Features

- **Isolated Environment**: Tests run in a clean container with no local dependencies
- **Consistent Results**: Same environment across different machines
- **CI/CD Ready**: Perfect for automated testing pipelines
- **Live Development**: Source code is mounted, changes reflect immediately
- **Coverage Reports**: Generated coverage reports are accessible locally

#### Troubleshooting Docker Tests

**Build Issues:**
```bash
# Clear Docker cache and rebuild
docker system prune -f
docker build --no-cache -t task-radar .
```

**Permission Issues:**
```bash
# On Linux, you might need to run as root or add user to docker group
sudo docker-compose run --rm test
```

**Container Won't Start:**
```bash
# Check Docker Desktop is running
# Verify no port conflicts
docker ps  # Check running containers
```

**Test Failures in Docker:**
```bash
# Run tests with verbose output
docker-compose run --rm test -- --verbose

# Run specific failing test
docker-compose run --rm test -- --testNamePattern="specific test name"
```

**Development with Docker:**
- The `docker-compose.yml` mounts your source code into the container
- Changes to source files are reflected immediately
- No need to rebuild the image for code changes
- Dependencies are isolated within the container

#### Docker Container Management

**Automatic Cleanup Script:**
A cleanup script is provided to automatically stop containers after 24 hours of inactivity:

```bash
# Run cleanup manually
./docker-cleanup.sh

# Preview what would be stopped (dry run)
./docker-cleanup.sh --dry-run

# Use different inactivity threshold (48 hours)
./docker-cleanup.sh --hours 48

# Cleanup different project
./docker-cleanup.sh --project myproject
```

*Note: Cleanup logs are saved to `docker-cleanup.log` in the project directory.*

**Setup Automatic Cleanup (macOS):**
```bash
# Edit crontab
crontab -e

# Add this line to run cleanup daily at 2 AM
0 2 * * * cd /path/to/GoogleSearchRadar && ./docker-cleanup.sh

# Save and exit (usually Ctrl+X, then Y, then Enter)
```

**Setup Automatic Cleanup (Linux):**
```bash
# Create a cron job
echo "0 2 * * * cd /path/to/GoogleSearchRadar && ./docker-cleanup.sh" | crontab -

# Or create a systemd timer (more reliable)
sudo nano /etc/systemd/system/docker-cleanup.service
sudo nano /etc/systemd/system/docker-cleanup.timer
sudo systemctl enable docker-cleanup.timer
sudo systemctl start docker-cleanup.timer
```

**Manual Container Management:**
```bash
# Stop all project containers
docker-compose down

# Stop specific service
docker-compose stop test

# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -f
```

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

The project includes both unit tests and integration tests to ensure comprehensive code quality and functionality.

### Unit Tests
Unit tests are implemented using Jest with jsdom for DOM simulation. They test individual components in isolation with comprehensive mocking of Chrome APIs and browser environments.

### Integration Tests
Integration tests validate the overall extension structure, file organization, and module integration without requiring a full browser environment. They ensure all components work together correctly through file structure validation and code pattern matching.

**Integration Test Features:**
- Extension file structure validation
- Manifest configuration verification
- Cross-component communication patterns
- Module syntax and export validation
- Popup UI structure integrity

### Test Setup
- **Unit Tests**: Jest with jsdom environment
- **Integration Tests**: Jest with Node environment for structural validation
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
# Install dependencies
npm install

# Run all tests (unit + integration)
npm run test:all

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure
```
tests/
├── unit/                    # Unit tests
│   ├── setup.js            # Global mocks
│   ├── TaskManager.test.js
│   ├── SearchAnalyzer.test.js
│   ├── TaskRadarContent.test.js
│   ├── TaskRadarPopup.test.js
│   └── background.test.js
└── integration/            # Integration tests (structural validation)
    ├── extension-integration.test.js
    ├── popup-integration.test.js
    └── workflow-integration.test.js
```

### Test Files
- `tests/unit/setup.js` — Global mocks and configuration
- `tests/unit/TaskManager.test.js` — Task management logic
- `tests/unit/SearchAnalyzer.test.js` — Search analysis algorithms
- `tests/unit/TaskRadarContent.test.js` — Content script functionality
- `tests/unit/TaskRadarPopup.test.js` — Popup interface
- `tests/unit/background.test.js` — Background script message handling
- `tests/integration/extension-integration.test.js` — Extension structure and file validation
- `tests/integration/popup-integration.test.js` — Popup UI integration
- `tests/integration/workflow-integration.test.js` — Component communication patterns

## Manifest

This extension uses Manifest V3. Primary permissions declared in `manifest.json` include `storage`, `activeTab`, and `scripting`, and host permissions for Google domains.

## Contributing

Feel free to open issues or submit pull requests. For larger changes, open an issue first to discuss the design.

## License

No license specified. Add a `LICENSE` file to clarify usage rights.

---
Generated from the repository manifest and source layout.
