# Project Goals

## Vision
Create a comprehensive, structured dataset derived from Wikipedia for the UK Series of "The Traitors" (Series 1-4). The project is evolving from a CSV-based ingestion tool into a robust, API-driven platform that leverages Firestore for data persistence and adopts an OpenAPI-first development approach to ensure scalability and consistency.

## Key Performance Indicators (KPIs)
- **Data Integrity**: 100% accuracy relative to Wikipedia source data.
- **API Standards**: 100% adherence to the defined OpenAPI Specification.
- **Test Coverage**: Maintain 80%+ test coverage across core packages.
- **Automation**: Maximize code generation from API specifications to ensure consistency between documentation and implementation.

## Major Milestones

### 1. API Architecture & Design
- Define a comprehensive OpenAPI Specification (OAS) covering all Traitors data entities (Candidates, Votes, Episodes, etc.).
- Establish an automated pipeline for generating TypeScript models and API stubs from the OAS.

### 2. Firestore Migration
- Design a Firestore schema that optimizes for common query patterns (e.g., filtering by series, searching for specific candidates).
- Transition data storage from CSV files and GCS to Firestore collections.

### 3. API Implementation
- Develop and deploy Firebase Cloud Functions that serve as the primary interface for querying Traitors data.
- Ensure the API supports flexible filtering and pagination.

### 4. Data Ingestion 2.0
- Refactor existing scraping logic to populate Firestore directly.
- Implement robust validation to ensure data quality before it reaches the database.

### 5. Deployment & Automation
- Full integration with GitHub Actions for CI/CD, including automated API documentation generation and deployment.