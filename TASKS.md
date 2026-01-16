# Task Backlog

## 1. Architecture & Data Modeling (Type-Safe & Modular)
- [ ] Implement Utility Layer (Pure Functions)

## 2. Core Scraper Implementation (Robust & Separated)
- [ ] Infrastructure Layer
    - [ ] `WikipediaFetcher`: Service for HTTP requests with retry logic and error handling.
    - [ ] `HtmlParser`: Generic interface for parsing HTML (decoupled from fetching).
- [ ] Logic Layer
    - [ ] `TableParser`: Strategy pattern for extracting data from different table structures.
- [ ] Persistence Layer
    - [ ] `CsvWriter`: Service to safely write typed objects to CSV rows.

## 3. Series Implementation
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

## 4. Data Aggregation & Final Polish
- [ ] Implement `DataMerger` to combine series data into master CSVs.
- [ ] Build CLI Entrypoint (e.g., `npm run ingest`).
- [ ] Validation Suite: Script to check integrity of generated CSVs (e.g., no orphaned votes).
- [ ] Documentation: `README.md` with setup, architecture overview, and schema dictionary.

# Completed Work

## Project Initialization
- [x] Initialize Repository Documentation (Goals, Tasks, Constitution, Context Map)
- [x] Update scope description in GOALS.md

<h2>Setup</h2>
<ul>
<li>[x] Initialize Node.js/TypeScript project
    - [x] <code>npm init</code>
    - [x] Configure <code>tsconfig.json</code> with <code>strict: true</code>, <code>noImplicitAny: true</code>, and <code>noEmitOnError: true</code>.</li>
<li>[x] Configure Strict Linting &amp; Formatting and enforce
    - [x] Install and configure ESLint with strict rules (e.g., no <code>any</code>, explicit return types).
    - [x] Install and configure Prettier.
    - [x] Ensure <code>npm run lint</code> fails on <em>any</em> warning or error.</li>
<li>[x] Set up Testing Infrastructure
    - [x] Install Jest or Vitest.
    - [x] Configure coverage reporting to fail if global coverage &lt; 90%.
    - [x] Set up Playwright for E2E scraper tests.</li>
<li>[x] Configure Git Hooks (Husky + lint-staged)
    - [x] Pre-commit: Run Prettier and ESLint.
    - [x] Pre-commit: Run unit tests related to changed files.
    - [x] Commit-msg: Install <code>commitlint</code> to enforce Conventional Commits.</li>
<li>[x] Create GitHub Actions CI Workflow
    - [x] Pipeline must run Lint, Build, and Test steps.
    - [x] Pipeline must fail if any step fails or coverage is unmet.</li>
<li>[x] Containerize application with Docker
    - [x] Refine Dockerfile for production-ready builds.
    - [x] Set up docker-compose for local development.</li>
<li>[x] Link shared libraries (State, Gemini, Jules, GitHub)
    - [x] Ensure local <code>file:</code> dependencies are correctly resolved in build pipeline.</li>
</ul>
<h2>Architecture &amp; Data Modeling</h2>
<ul>
<li>[x] Define Domain Entities (Strict Interfaces)
    - [x] <code>Candidate</code> (with strict enums for Status/Role).
    - [x] <code>Episode</code>, <code>Round</code>, <code>Vote</code>, <code>Banishment</code>, <code>Murder</code>.</li>
<li>[x] Design CSV Schema
    - [x] Define strict column mappings for <code>candidates.csv</code>, <code>votes.csv</code>, etc.</li>
<li>[x] Implement Utility Layer (Pure Functions)
    - [x] Type guards for parsing untrusted external data.
    - [x] Data normalizers (dates, names).</li>
</ul>