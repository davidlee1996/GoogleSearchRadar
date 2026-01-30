# GitHub Actions CI Pipeline

This directory contains the GitHub Actions workflow for continuous integration (CI) of the Google Search Radar project.

## Workflow: CI

The CI workflow is defined in [`ci.yml`](ci.yml) and runs automatically on:

- Pushes to the `main` branch
- Pull requests targeting the `main` branch

### Jobs

The workflow consists of the following jobs, each running on Ubuntu with Node.js versions 18.x and 20.x:

1. **Unit Tests** (`test-unit`)
   - Runs unit tests using Jest
   - Command: `npm run test:unit`
   - Uploads test logs as artifacts on failure

2. **Integration Tests** (`test-integration`)
   - Runs integration tests using Jest
   - Command: `npm run test:integration`
   - Uploads test logs as artifacts on failure

3. **Load Tests** (`test-load`)
   - Runs load tests using Jest
   - Command: `npm run test:load`
   - Uploads test logs as artifacts on failure

4. **End-to-End Tests** (`test-e2e`)
   - Runs e2e tests using Jest and Puppeteer
   - Command: `npm run test:e2e`
   - Uploads test logs as artifacts on failure

### Artifacts

Each job uploads logs and any generated files as artifacts if the job fails, allowing for easy debugging of test failures.

### Dependencies

- Node.js (18.x and 20.x)
- npm for package management
- Jest for testing
- Puppeteer for e2e tests

### Local Testing

To run tests locally before pushing:

```bash
npm install
npm run test:unit
npm run test:integration
npm run test:load
npm run test:e2e
```

Or run all tests:

```bash
npm run test:all  # Note: This only runs unit and integration; run others separately
```

### Troubleshooting

- Check the Actions tab in GitHub for workflow runs
- Download artifacts from failed runs for detailed logs
- Ensure all dependencies are installed and tests pass locally