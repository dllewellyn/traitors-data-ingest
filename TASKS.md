# Task Backlog

## 1. Project Setup & Quality Assurance (Strict Guardrails)
- [ ] Link shared libraries (State, Gemini, Jules, GitHub)
    - [ ] Ensure local `file:` dependencies are correctly resolved in build pipeline.

## 2. Architecture & Data Modeling (Type-Safe & Modular)
- [ ] Implement Utility Layer (Pure Functions)
    - [ ] Data normalizers (dates, names).
    - [x] Type guards for parsing untrusted external data.

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

## Architecture & Data Modeling
- [x] Define Domain Entities (Strict Interfaces)
    - [x] `Candidate` (with strict enums for Status/Role).
    - [x] `Episode`, `Round`, `Vote`, `Banishment`, `Murder`.
- [x] Design CSV Schema
    - [x] Define strict column mappings for `candidates.csv`, `votes.csv`, etc.