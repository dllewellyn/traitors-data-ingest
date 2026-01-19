# Task Backlog

## 1. Firebase Deployment & Cloud Infrastructure

### Phase 0: Local Testing Infrastructure (DO THIS FIRST)
- [ ] **Firebase Emulator Setup**
  - [X] Install Firebase CLI: `npm install -g firebase-tools`
  - [X] Authenticate: `firebase login`
  - [X] Initialize emulators: `firebase init emulators`
  - [X] Configure emulator suite (Hosting, Functions, optional: Storage)
  - [X] Add npm script: `"emulate": "firebase emulators:start"`
  - [X] Document emulator ports and access URLs in README and fully describe the setup in AGENTS.md

- [ ] **Local Testing Workflow**
  - [ ] Create test Firebase Functions with Express app wrapper
  - [ ] Test functions locally with emulator: `npm run emulate`
  - [ ] Verify hot-reload functionality for development
  - [ ] Test CSV file serving through emulated hosting
  - [ ] Validate local package dependencies work in emulated environment and fully describe the setup in AGENTS.md

- [ ] **Manual Trigger Implementation**
  - [ ] Create HTTP endpoint for manual data ingestion: `/api/ingest`
  - [ ] Add authentication/security token for manual trigger
  - [ ] Test manual trigger locally with emulator
  - [ ] Document manual trigger usage for maintainers
  - [ ] Add npm script: `"trigger:local": "curl http://localhost:5001/.../api/ingest"`

- [ ] **Emulator Integration Tests**
  - [ ] Write integration tests that use Firebase emulator
  - [ ] Test API endpoints against emulated functions
  - [ ] Verify CSV data accessibility through emulated hosting
  - [ ] Add emulator tests to CI pipeline (optional)
  - [ ] Document testing workflow in CONSTITUTION.md

### Phase 1: Firebase Setup
- [X] **Initialize Firebase Project**
  - [X] Create Firebase project in console
  - [X] Initialize hosting: `firebase init hosting`
  - [X] Initialize functions: `firebase init functions`
  - [X] Configure `firebase.json` and `.firebaserc`
  
### Phase 2: Firebase Hosting Configuration
- [ ] **Static File Serving**
  - [ ] Configure hosting to serve CSV files from `data/` directory
  - [ ] Set up CDN caching headers for CSV files
  - [ ] Configure CORS for cross-origin data access
  - [ ] Test CSV file accessibility via Firebase Hosting URLs

### Phase 3: Cloud Functions for API
- [ ] **Migrate Express App to Functions**
  - [ ] Move Express app to `functions/src/` directory
  - [ ] Wrap Express app: `exports.api = functions.https.onRequest(app)`
  - [ ] Create manual ingestion endpoint: `exports.ingest = functions.https.onRequest(...)`
  - [ ] Configure rewrite rules in `firebase.json` to route API requests
  
- [ ] **Function Development**
  - [ ] Adapt build process for Cloud Functions environment
  - [ ] Handle local package dependencies (`file:` protocol) in Functions
  - [ ] Configure environment variables via Firebase Config
  - [ ] Re-test with Firebase emulator before deployment

### Phase 4: Data Ingestion Strategy
- [ ] **Maintain GitHub Actions Approach**
  - [ ] Keep existing `audit-data.yml` workflow for scheduled ingestion
  - [ ] Ensure workflow commits updated CSVs to repository
  - [ ] Verify Firebase Hosting auto-deploys on data commits
  
- [ ] **Optional: Cloud Scheduler Backup**
  - [ ] Create Cloud Function endpoint for manual ingestion trigger
  - [ ] Set up Cloud Scheduler to call ingestion endpoint
  - [ ] Implement GCS adapter for cloud-based data persistence

### Phase 5: Deployment & Testing
- [ ] **Initial Deployment**
  - [ ] Deploy hosting: `firebase deploy --only hosting`
  - [ ] Deploy functions: `firebase deploy --only functions`
  - [ ] Verify API endpoint accessibility
  - [ ] Verify CSV file serving via CDN
  
- [ ] **Integration Testing**
  - [ ] Test end-to-end data flow (scrape → commit → hosting update)
  - [ ] Verify function cold start performance
  - [ ] Monitor Firebase quotas and costs
  - [ ] Set up Firebase monitoring and alerts

### Phase 6: Documentation & Optimization
- [ ] **Update Documentation**
  - [ ] Document Firebase deployment process in README
  - [ ] Add Firebase hosting URLs to documentation
  - [ ] Create deployment runbook for maintainers
  
- [ ] **Performance Optimization**
  - [ ] Optimize function bundle size
  - [ ] Configure function memory/timeout settings
  - [ ] Implement caching strategies for API responses
  - [ ] Set up custom domain (optional)

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
- [x] **Auditing**: Automation to commit/persist CSVs to repository history.
