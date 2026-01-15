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
- **Types**: Unit tests for logic, Integration/E2E tests for scraping workflows.
- **Failure**: A broken build is a top priority fix.

## 4. Architecture & Design
- **Separation of Concerns**: Strict separation between Data Fetching (Scrapers), Data Parsing (Logic), and Data Persistence (CSV Writing).
- **Immutability**: Prefer immutable data structures and pure functions where possible.
- **Error Handling**: No silent failures. All errors must be caught, logged, and handled or propagated explicitly.

## 5. Workflow & Version Control
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/) format (e.g., `feat: add scraper`, `fix: parsing error`).
- **Review**: Self-review is mandatory before "requesting review" (or completing a task).
- **CI**: All checks (Lint, Test, Build) must pass before a task is considered done.
