# Context Map

## Project Structure Overview

### Root Directory
- `/package.json`: Main workspace configuration (npm workspaces).
- `/firebase.json`: Firebase project configuration (Hosting, Functions, Emulators).
- `/firestore.rules`: Security rules for Cloud Firestore.
- `/storage.rules`: Security rules for Firebase Storage (GCS).
- `/GOALS.md`, `/TASKS.md`, `/CONSTITUTION.md`: Project management and governance.

### Packages
- `packages/core/`: The heart of the system.
    - `src/domain/`: Core data models and types (e.g., `Candidate`, `Vote`).
    - `src/scrapers/`: Series-specific scrapers and table parsers.
    - `src/services/`: Utility services (Fetcher, HTML Parser, CSV utilities).
    - `src/persistence/`: Data writers (Firestore, CSV, GCS).
    - `api/`: OpenAPI Specification (`openapi.yaml`) and generated types.
- `packages/state/`, `packages/gemini/`, `packages/jules/`, `packages/github/`: Integration packages for external agents and tools.

### Firebase Functions
- `traitors-functions/src/index.ts`: Entry point for Firebase Cloud Functions.
- `traitors-functions/src/app.ts`: Express.js application serving the API.

### Data & Scripts
- `data/`: Local cache of scraped CSV files (historical/audit purposes).
- `scripts/`: Development scripts for build and manual ingestion.

### CI/CD
- `.github/workflows/`: GitHub Actions for linting, testing, and deployment.

## Data Flow
1.  **Ingestion**: Scraper fetches HTML from Wikipedia -> Parsers convert to Typed Objects.
2.  **Validation**: `DataValidator` ensures referential integrity.
3.  **Persistence**: Data is written to **Cloud Firestore**.
4.  **Delivery**: **Firebase Cloud Functions** serve data via a JSON API defined by the **OpenAPI Spec**.