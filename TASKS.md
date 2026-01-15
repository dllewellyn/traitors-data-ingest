# Task Backlog

## 1. Project Setup & Quality Assurance (Strict Guardrails)
- [ ] Initialize Node.js/TypeScript project
    - [ ] `npm init`
    - [ ] Configure `tsconfig.json` with `strict: true`, `noImplicitAny: true`, and `noEmitOnError: true`.
- [ ] Configure Strict Linting & Formatting
    - [ ] Install and configure ESLint with strict rules (e.g., no `any`, explicit return types).
    - [ ] Install and configure Prettier.
    - [ ] Ensure `npm run lint` fails on *any* warning or error.
- [ ] Configure Git Hooks (Husky + lint-staged)
    - [ ] Pre-commit: Run Prettier and ESLint.
    - [ ] Pre-commit: Run unit tests related to changed files.
    - [ ] Commit-msg: Install `commitlint` to enforce Conventional Commits.
- [ ] Set up Testing Infrastructure
    - [ ] Install Jest or Vitest.
    - [ ] Configure coverage reporting to fail if global coverage < 90%.
    - [ ] Set up Playwright for E2E scraper tests.
- [ ] Create GitHub Actions CI Workflow
    - [ ] Pipeline must run Lint, Build, and Test steps.
    - [ ] Pipeline must fail if any step fails or coverage is unmet.

## 2. Architecture & Data Modeling (Type-Safe & Modular)
- [ ] Define Domain Entities (Strict Interfaces)
    - [ ] `Candidate` (with strict enums for Status/Role).
    - [ ] `Episode`, `Round`, `Vote`, `Banishment`, `Murder`.
- [ ] Design CSV Schema
    - [ ] Define strict column mappings for `candidates.csv`, `votes.csv`, etc.
- [ ] Implement Utility Layer (Pure Functions)
    - [ ] Data normalizers (dates, names).
    - [ ] Type guards for parsing untrusted external data.

## 3. Core Scraper Implementation (Robust & Separated)
- [ ] Infrastructure Layer
    - [ ] `WikipediaFetcher`: Service for HTTP requests with retry logic and error handling.
    - [ ] `HtmlParser`: Generic interface for parsing HTML (decoupled from fetching).
- [ ] Logic Layer
    - [ ] `TableParser`: Strategy pattern for extracting data from different table structures.
- [ ] Persistence Layer
    - [ ] `CsvWriter`: Service to safely write typed objects to CSV rows.

## 4. Series Implementation
- [ ] **Series 1**:
    - [ ] Scrape Candidate Table.
    - [ ] Scrape Progress/Voting Table.
    - [ ] Integration Test: Verify S1 output matches expected snapshot.
- [ ] **Series 2**:
    - [ ] Adapt `TableParser` for S2 variations.
    - [ ] Scrape Candidate & Progress Tables.
- [ ] **Series 3**:
    - [ ] Scrape Candidate & Progress Tables.
- [ ] **Series 4**:
    - [ ] Scrape Candidate & Progress Tables.

## 5. Data Aggregation & Final Polish
- [ ] Implement `DataMerger` to combine series data into master CSVs.
- [ ] Build CLI Entrypoint (e.g., `npm run ingest`).
- [ ] Validation Suite: Script to check integrity of generated CSVs (e.g., no orphaned votes).
- [ ] Documentation: `README.md` with setup, architecture overview, and schema dictionary.