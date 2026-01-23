# Task Backlog

## Fix Build & Runtime Errors
- [ ] **Fix Series 4 Vote Parsing**
  - [ ] Investigate and fix "Could not resolve vote target" errors for Series 4, Episode 12 (Faraaz, Jack, Jade, James, Rachel, Stephen).
- [ ] **Fix Series 3 Role Parsing**
  - [ ] Investigate and fix "Unknown role 'None'" warning for Jack Marriner-Brown in Series 3.
- [ ] **Fix Series 1 Test Warnings**
  - [ ] Investigate `Series1CandidateParser` warnings seen in tests ("Unknown Role", "Withdrew (Episode 2)").

# Completed Work

## Operations & Monitoring
- [x] **Monitor Ingestion Workflow**
  - [x] Add monitoring and alerting to the scheduled ingestion workflow to notify on failures.
- [x] **Manual Ingestion Workflow**
  - [x] Create a manually triggerable GitHub Actions workflow that allows specifying which series to ingest for backfills or corrections.

## CI/CD
- [x] **Scheduled Ingestion**
  - [x] Implement a GitHub Actions workflow to run the ingestion script on a daily schedule.
- [x] **CI/CD Refactoring**
  - [x] Refactor deployment logic into a dedicated CD workflow (`deploy.yml`).
- [x] **CI/CD Updates**
  - [x] Add deployment step for Firestore security rules and indexes.
  - [x] Update GitHub Actions to include Firestore emulator tests.

## API Enhancements
- [x] **Functionality**
  - [x] Add pagination to the `/series/{id}/votes` endpoint.
  - [x] Add sorting options to the `/series/{id}/candidates` endpoint (e.g., by name, status).
- [x] **Performance**
  - [x] Add pagination to the `/series/{id}/candidates` endpoint to optimize data fetching.
  - [x] Implement caching headers for API responses in Cloud Functions.

## API Documentation
- [x] **API Documentation**
  - [x] Set up Swagger UI or Redoc to serve the OpenAPI spec via Firebase Hosting.

## Deprecation & Cleanup
- [x] **Clean Up Data Files**
  - [x] Remove CSV generation from the ingestion pipeline as data is now written directly to Firestore.
- [x] **Remove Redundant Persistence Code**
  - [x] Remove `LocalStorageWriter` and `CsvWriter` now that `FirestoreStorageWriter` is fully operational.

## Firestore Security & Validation
- [x] **Validation & Integrity**
  - [x] Implement a "dry run" mode for ingestion to verify data before committing to Firestore.
  - [x] Adapt `DataValidator` to work with Firestore documents instead of CSV rows.
- [x] **Security Rules**
  - [x] Define `firestore.rules` to restrict access (read-only for public, write-only for service account/ingestion).

## Firestore Migration
- [x] **Persistence Layer Refactoring**
  - [x] Implement a migration script to upload existing CSV data from `data/` to Firestore.
- [x] **Database Schema Design**
  - [x] Define Firestore collection structure (e.g., `series`, `candidates`, `votes`).
  - [x] Design indexes for common query patterns identified in the OAS.
- [x] **Persistence Layer Refactoring**
  - [x] Implement `FirestoreStorageWriter` in `packages/core/src/persistence/`.
  - [x] Update `orchestrator.ts` to support writing to Firestore.

## OpenAPI & API Design
- [x] **API Implementation**
  - [x] Refactor Cloud Functions to use generated types and interfaces.
  - [x] Implement query logic in Firebase Functions to fetch data from Firestore.
- [x] **Automate Code Generation**
  - [x] Set up `openapi-typescript` or similar tool to generate TypeScript interfaces from the OAS.
  - [x] Integrate generation into the build pipeline (`npm run generate-api`).
- [x] **Define OpenAPI Specification**
  - [x] Create `packages/core/api/openapi.yaml` defining the schema for Candidates, Votes, and Series.
  - [x] Define endpoints for querying data (e.g., `GET /series/{id}/candidates`, `GET /candidates/{id}`).

## Data Ingestion 2.0
- [x] **Direct-to-Firestore Pipeline**
  - [x] Update `ingest.ts` script to bypass local CSV creation and write directly to Firestore (or support both as a flag).
  - [x] Implement batch writing/transactions for atomic updates of series data.

## Firebase Infrastructure & Deployment
- [x] **Initialize Firestore**
  - [x] Run `firebase_init` to enable Firestore in the project.
  - [x] Configure Firestore emulator in `firebase.json`.

## Architectural Pivot to OpenAPI & Firestore
- [x] Redefined project goals towards an API-first, Firestore-backed architecture.
- [x] Updated project documentation (`CONTEXT_MAP`, `CONSTITUTION`) to reflect new architecture.
- [x] Created new project backlog for OpenAPI, Firestore, and Ingestion 2.0.
- [x] **Remove Redundant Persistence Code**
  - [x] Remove `GCSStorageWriter` and `LocalStorageWriter` (kept Local for dev) once `FirestoreStorageWriter` is fully operational.
  - [x] Remove `storage.rules` (Firebase Storage).
- [x] **Codebase Housekeeping**
  - [x] Audit dependencies for unused packages (`gemini`, `jules`, etc. removed).
  - [x] Remove ` @google-cloud/storage` dependency.

## Project Initialization
- [x] Initialize Repository Documentation (Goals, Tasks, Constitution, Context Map)
- [x] Update scope description in GOALS.md

## Setup
- [x] Initialize Node.js/TypeScript project
- [x] Configure Strict Linting & Formatting
- [x] Set up Testing Infrastructure
- [x] Configure Git Hooks (Husky + lint-staged)
- [x] Create GitHub Actions CI Workflow
- [x] Containerize application with Docker
- [x] Link shared libraries (State, Gemini, Jules, GitHub)

## Firebase
- [x] **Initialize Firebase Project**
- [x] **Migrate Express App to Functions**
- [x] **Firebase Emulator Setup**
- [x] **Manual Trigger Implementation**
- [x] **Emulator Integration Tests**
- [x] **Implement Cloud-Native Persistence** (GCS/Local)

## Architecture & Data Modeling
- [x] Refactor core ingestion logic into a shared package (` @gcp-adl/core`)
- [x] Define Domain Entities (Strict Interfaces)
- [x] Design CSV Schema
- [x] Implement Utility Layer (Pure Functions)

## Core Scraper Implementation
- [x] Infrastructure Layer (WikipediaFetcher, HtmlParser)
- [x] Logic Layer (TableParser)
- [x] Persistence Layer (CsvWriter)

## Data Aggregation
- [x] Implement `DataMerger`
- [x] Build CLI Entrypoint (`npm run ingest`)

## Data Validation
- [x] Validation Suite (CLI script)
- [x] `CsvReader` & `DataValidator`
- [x] **CI Integration**

## Series Implementation
- [x] Series 1: Scrape Candidate & Progress Tables
- [x] Series 2: Scrape Candidate & Progress Tables
- [x] Series 3: Scrape Candidate & Progress Tables
- [x] Series 4: Scrape Candidate & Progress Tables

## Documentation & Polish
- [x] Documentation: `README.md`
- [x] **Auditing**: Automation to commit/persist CSVs