# Task Backlog

## 1. OpenAPI & API Design
- [ ] **Define OpenAPI Specification**
  - [ ] Create `packages/core/api/openapi.yaml` defining the schema for Candidates, Votes, and Series.
  - [ ] Define endpoints for querying data (e.g., `GET /series/{id}/candidates`, `GET /candidates/{id}`).
- [ ] **Automate Code Generation**
  - [ ] Set up `openapi-typescript` or similar tool to generate TypeScript interfaces from the OAS.
  - [ ] Integrate generation into the build pipeline (`npm run generate-api`).
- [ ] **API Implementation**
  - [ ] Refactor Cloud Functions to use generated types and interfaces.
  - [ ] Implement query logic in Firebase Functions to fetch data from Firestore.

## 2. Firestore Migration
- [ ] **Database Schema Design**
  - [ ] Define Firestore collection structure (e.g., `series`, `candidates`, `votes`).
  - [ ] Design indexes for common query patterns identified in the OAS.
- [ ] **Persistence Layer Refactoring**
  - [ ] Implement `FirestoreStorageWriter` in `packages/core/src/persistence/`.
  - [ ] Update `orchestrator.ts` to support writing to Firestore.
  - [ ] Implement a migration script to upload existing CSV data from `data/` to Firestore.
- [ ] **Security Rules**
  - [ ] Define `firestore.rules` to restrict access (read-only for public, write-only for service account/ingestion).
  - [ ] Verify rules with `firebase_validate_security_rules`.

## 3. Data Ingestion 2.0
- [ ] **Direct-to-Firestore Pipeline**
  - [ ] Update `ingest.ts` script to bypass local CSV creation and write directly to Firestore (or support both as a flag).
  - [ ] Implement batch writing/transactions for atomic updates of series data.
- [ ] **Validation & Integrity**
  - [ ] Adapt `DataValidator` to work with Firestore documents instead of CSV rows.
  - [ ] Implement a "dry run" mode for ingestion to verify data before committing to Firestore.

## 4. Firebase Infrastructure & Deployment
- [ ] **Initialize Firestore**
  - [ ] Run `firebase_init` to enable Firestore in the project.
  - [ ] Configure Firestore emulator in `firebase.json`.
- [ ] **CI/CD Updates**
  - [ ] Update GitHub Actions to include Firestore emulator tests.
  - [ ] Add deployment step for Firestore security rules and indexes.

## 5. Documentation & Optimization
- [ ] **API Documentation**
  - [ ] Set up Swagger UI or Redoc to serve the OpenAPI spec via Firebase Hosting.
- [ ] **Performance**
  - [ ] Implement caching headers for API responses in Cloud Functions.
  - [ ] Optimize Firestore queries for low latency.

## 6. Deprecation & Cleanup
- [ ] **Clean Up Data Files**
  - [ ] Archive or delete legacy CSV files in `data/` once migration is confirmed.
  - [ ] Remove `firebase-data/` export directory if no longer needed.

# Completed Work

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