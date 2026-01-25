# Task Radar MVP

Detects tasks from your Google searches and helps you track them.

## Overview

Task Radar is a small Chrome/Chromium extension (MV3) that injects a content script into Google search pages to detect task-like queries, provides a popup UI, and uses a background service worker for coordination and storage.

For detailed information about the source code structure and components, see [`src/README.md`](src/README.md).

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

### Docker Setup (Optional)
For isolated development and testing environments, Docker can be used.

**Prerequisites:**
- Docker installed on your system
- docker-compose (usually comes with Docker Desktop)

#### Quick Start with Docker
```bash
# Run all tests
docker-compose run --rm test

# Run tests with coverage
docker-compose run --rm coverage

# Run tests in watch mode
docker-compose run --rm test-watch
```

For detailed Docker instructions, including troubleshooting and container management, see the Docker section below.

#### Docker Development Workflow
- Tests run in isolated containers with no local dependencies
- Source code is mounted for live development
- Consistent environment across machines
- Automatic cleanup script available (`./docker-cleanup.sh`)

#### Troubleshooting Docker Tests
- **Build issues**: `docker system prune -f && docker build --no-cache -t task-radar .`
- **Permission issues**: On Linux, run as root or add user to docker group
- **Container issues**: Check Docker Desktop is running and no port conflicts
- **Test failures**: Run with verbose output: `docker-compose run --rm test -- --verbose`

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

Edit source files in the `src/` directory and reload the unpacked extension. For detailed information about the codebase, see [`src/README.md`](src/README.md).

## Testing

The project includes comprehensive unit, integration, load, and e2e tests. For CI/CD pipeline details, see [`.github/workflows/README.md`](.github/workflows/README.md).

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

# Run load tests
npm run test:load

# Run e2e tests
npm run test:e2e

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

Test files are located in the `tests/` directory.

## Manifest

This extension uses Manifest V3. Primary permissions declared in `manifest.json` include `storage`, `activeTab`, and `scripting`, and host permissions for Google domains.

## Contributing

Feel free to open issues or submit pull requests. For larger changes, open an issue first to discuss the design.

## License

No license specified. Add a `LICENSE` file to clarify usage rights.

---
Generated from the repository manifest and source layout.
