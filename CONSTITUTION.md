# Repository Constitution

## 1. Technology Stack
- **Language**: TypeScript (Strict Mode enabled). No usage of `any` permitted unless absolutely unavoidable and documented with a `// eslint-disable-next-line` explanation.
- **Runtime**: Node.js (LTS version).
- **Libraries**: Minimal dependencies. Prefer standard library or well-maintained, small-footprint packages.

## 2. Code Quality & Style
- **Linting**: Strict ESLint configuration. Zero tolerance for linting errors.
- **Formatting**: Prettier for code formatting. All files must be formatted before commit.
- **Naming**: PascalCase for classes/interfaces, camelCase for variables/functions, UPPER_SNAKE_CASE for constants.
- **Comments**: JSDoc for all public interfaces and complex logic. Comments should explain *why*, not *what*.
- **Imports**: Clean, grouped imports (Standard Lib -> External -> Internal).

## 3. Testing Standards
- **Requirement**: No feature is complete without accompanying tests.
- **Coverage**: Maintain >90% code coverage for business logic.
- **Types**: 
  - Unit tests for logic and utilities
  - Integration/E2E tests for scraping workflows
  - Emulator tests for Firebase Functions and Hosting
- **Local Testing**: All Firebase features must be testable locally via emulators before deployment.
- **Manual Triggers**: Provide HTTP endpoints for manual data operations during development and testing.
- **Failure**: A broken build is a top priority fix.

## 4. Architecture & Design
- **Separation of Concerns**: Strict separation between Data Fetching (Scrapers), Data Parsing (Logic), and Data Persistence (CSV Writing).
- **Immutability**: Prefer immutable data structures and pure functions where possible.
- **Error Handling**: No silent failures. All errors must be caught, logged, and handled or propagated explicitly.

## 5. Workflow & Version Control
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/) format (e.g., `feat: add scraper`, `fix: parsing error`).
- **Review**: Self-review is mandatory before "requesting review" (or completing a task).
- **CI**: All checks (Lint, Test, Build) must pass before a task is considered done.

## 6. Deployment & Infrastructure
- **Platform**: Firebase (Google Cloud Platform) for production hosting and API delivery.
- **Architecture**: Hybrid serverless approach combining:
  - **Firebase Hosting**: CDN-backed static file serving for CSV datasets
  - **Cloud Functions**: Serverless API endpoints (Express.js wrapper)
  - **GitHub Actions**: Automated data ingestion with git-based persistence
- **Data Persistence**: Primary storage in repository (version-controlled CSVs), with optional Cloud Storage for backup.
- **Local Development**: Firebase Emulator Suite is mandatory for testing before deployment.
  - All functions must be testable locally: `npm run emulate`
  - Manual trigger endpoints must be available for development: `/api/ingest`
  - No direct production deployments without emulator validation
- **Deployment Strategy**: Incremental, testable rollouts. Never replace working infrastructure without proven alternatives.
- **Monitoring**: Firebase performance monitoring and error tracking for production endpoints.
