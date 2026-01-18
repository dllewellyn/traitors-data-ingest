# Task Backlog

## 1. Data Aggregation & Final Polish
- [ ] **Auditing**: Automation to commit/persist CSVs to repository history.

## 2. Cloud Infrastructure & Automation
- [ ] **Firebase Setup**: Initialize project and configure credentials.
- [ ] **Storage**: Implement GCS (Google Cloud Storage) adapter for data persistence.
- [ ] **Automation**: Develop Firebase Function for daily (24h) polling/ingestion.

# Completed Work

## Project Initialization
- [x] Initialize Repository Documentation (Goals, Tasks, Constitution, Context Map)
- [x] Update scope description in GOALS.md

## Setup
- [x] Initialize Node.js/TypeScript project
    - [x] `npm init`
    - [x] Configure `tsconfig.json` with `strict: true`, `noImplicitAny: true`, and `noEmitOnError: true`.
- [x] Configure Strict Linting & Formatting and enforce
    - [x] Install and configure ESLint with strict rules (e.g., no `any`, explicit return types).
    - [x] Install and configure Prettier.
    - [x] Ensure `npm run lint` fails on *any* warning or error.
- [x] Set up Testing Infrastructure
    - [x] Install Jest or Vitest.
    - [x] Configure coverage reporting to fail if global coverage < 90%.
    - [x] Set up Playwright for E2E scraper tests.
- [x] Configure Git Hooks (Husky + lint-staged)
    - [x] Pre-commit: Run Prettier and ESLint.
    - [x] Pre-commit: Run unit tests related to changed files.
    - [x] Commit-msg: Install `commitlint` to enforce Conventional Commits.
- [x] Create GitHub Actions CI Workflow
    - [x] Pipeline must run Lint, Build, and Test steps.
    - [x] Pipeline must fail if any step fails or coverage is unmet.
- [x] Containerize application with Docker
    - [x] Refine Dockerfile for production-ready builds.
    - [x] Set up docker-compose for local development.
- [x] Link shared libraries (State, Gemini, Jules, GitHub)
    - [x] Ensure local `file:` dependencies are correctly resolved in build pipeline.

## Architecture & Data Modeling
- [x] Define Domain Entities (Strict Interfaces)
    - [x] `Candidate` (with strict enums for Status/Role).
    - [x] `Episode`, `Round`, `Vote`, `Banishment`, `Murder`.
- [x] Design CSV Schema
    - [x] Define strict column mappings for `candidates.csv`, `votes.csv`, etc.
- [x] Implement Utility Layer (Pure Functions)
    - [x] Type guards for parsing untrusted external data.
    - [x] Data normalizers (dates, names).

## Core Scraper Implementation
- [x] Infrastructure Layer
    - [x] `WikipediaFetcher`: Service for HTTP requests with retry logic and error handling.
    - [x] `HtmlParser`: Generic interface for parsing HTML (decoupled from fetching).
- [x] Logic Layer
    - [x] `TableParser`: Strategy pattern for extracting data from different table structures.
- [x] Persistence Layer
    - [x] `CsvWriter`: Service to safely write typed objects to CSV rows.

## Data Aggregation
- [x] Implement `DataMerger` to combine series data into master CSVs.
- [x] Build CLI Entrypoint (`npm run ingest`).

## Data Validation
- [x] Validation Suite: CLI script (`npm run validate`) to check integrity of generated CSVs (e.g., no orphaned votes).
- [x] `CsvReader`: Service for reading and parsing CSV files with numeric casting support.
- [x] `DataValidator`: Logic to verify referential integrity and schema compliance for processed data.
- [x] **CI Integration**: Add `npm run validate` to the GitHub Actions workflow to ensure data integrity on every PR.

## Series 1 Implementation
- [x] Scrape Candidate Table.
- [x] Scrape Progress/Voting Table.
- [x] Integration Test: Verify S1 output matches expected snapshot.

## Series 2 Implementation
- [x] Adapt `TableParser` for S2 variations.
- [x] Scrape Candidate & Progress Tables.

## Series 3 Implementation
- [x] Scrape Candidate & Progress Tables.
- [x] Handle "Eliminated" status code (affecting Series 1 & 3).

## Series 4 Implementation
- [x] Scrape Candidate & Progress Tables.

## Documentation & Polish
- [x] Documentation: `README.md` with setup, architecture overview, and schema dictionary.