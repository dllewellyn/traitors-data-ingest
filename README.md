# The Traitors Scraper

The Traitors Scraper is a robust data aggregation tool designed to extract, normalize, and validate data from Wikipedia pages for "The Traitors" (British series). It produces structured CSV datasets suitable for analysis and machine learning.

## Project Status

| Series | Status |
| :--- | :--- |
| Series 1 | ✅ **Fully Implemented** |
| Series 2 | ✅ **Fully Implemented** |
| Series 3 | ✅ **Fully Implemented** |
| Series 4 | ✅ **Fully Implemented** |

## Architecture Overview

The project adheres to a strict separation of concerns, as defined in `CONTEXT_MAP.md`:

-   **Infrastructure** (`src/services/`): Handles external I/O and generic parsing.
    -   `WikipediaFetcher`: Fetches raw HTML with retry logic and caching.
    -   `HtmlParser`: Generic HTML parsing capabilities.
    -   `CsvWriter` / `CsvReader`: Handles CSV persistence with type safety.
    -   `DataValidator`: Enforces referential integrity and schema validation.
-   **Logic** (`src/scrapers/`, `src/domain/`): Contains business logic and domain models.
    -   `Scrapers`: Series-specific logic to handle structural variations in Wikipedia tables.
    -   `Domain`: Strict TypeScript interfaces (`Candidate`, `Vote`) and Enums (`Role`, `Status`).
-   **Persistence** (`data/`): Stores the generated artifacts.
    -   `all_candidates.csv`: Master list of all contestants.
    -   `all_votes.csv`: Complete history of banishment votes.

## Setup & Usage

### Prerequisites

-   Node.js (v20.x recommended)
-   npm

### Installation

```bash
npm install
```

### Development

Run the development server (with hot-reload):

```bash
npm run dev
```

Alternatively, run with Docker:

```bash
docker-compose up
```

### Local Development (Firebase Emulators)

To run the Firebase Functions and Hosting emulators locally:

1.  Ensure dependencies are installed:
    ```bash
    npm install
    cd functions && npm install
    ```
2.  Start the emulators:
    ```bash
    npm run emulate
    ```
3.  Access the services:

    | Service | Port | URL | Description |
    | :--- | :--- | :--- | :--- |
    | **Hosting** | 5000 | `http://localhost:5000` | Serves static assets (CSVs) and rewrites API calls. |
    | **Functions** | 5001 | `http://localhost:5001` | Cloud Functions backend (direct access). |
    | **Emulator UI** | 4000 | `http://localhost:4000` | Graphical interface to view logs and data. |
    | **API Endpoint** | 5000 | `http://localhost:5000/api/` | Main entry point for API (via Hosting rewrite). |

### Data Ingestion

Scrape Wikipedia and regenerate the CSV datasets:

```bash
npm run ingest
```

### Local Development with Firebase Emulators

1.  **Start the Emulators:**
    This command builds the functions and starts the Firebase Emulator Suite (Hosting, Functions, etc.).
    ```bash
    npm run emulate
    ```
    - Emulator UI: http://localhost:4000
    - Functions: http://localhost:5001
    - Hosting: http://localhost:5000

2.  **Trigger Ingestion Manually:**
    Once the emulators are running, you can manually trigger the ingestion process.
    ```bash
    npm run trigger:local
    ```
    This sends an authenticated request to the `/api/ingest` endpoint.

3.  **Run Function Tests:**
    Unit and integration tests for the Cloud Functions are located in the `functions/` directory.
    ```bash
    cd functions && npm test
    ```

This will produce `data/all_candidates.csv` and `data/all_votes.csv`.

### Validation

Verify the integrity of the generated data (e.g., ensuring all votes reference valid candidates):

```bash
npm run validate
```

### Automated Auditing

This repository includes a GitHub Actions workflow (`.github/workflows/audit-data.yml`) that runs automatically every day at 06:00 UTC. This workflow:

1.  **Ingests**: Scrapes the latest data from Wikipedia.
2.  **Validates**: Checks for data integrity (referential integrity, schema compliance).
3.  **Persists**: Commits any changes to the `data/` directory back to the repository.

You can verify the "Last Updated" status of the dataset by checking the commit history of the `data/` directory or looking for commits by `github-actions[bot]`.

## Data Dictionary

### Candidates (`data/all_candidates.csv`)

| Column | Type | Description |
| :--- | :--- | :--- |
| `series` | Integer | The season number (e.g., 1). |
| `id` | Integer | Unique identifier for the candidate within the series. |
| `name` | String | Full name of the candidate. |
| `age` | Integer | Age of the candidate during the show. |
| `job` | String | Occupation of the candidate. |
| `location` | String | Hometown or location of the candidate. |
| `originalRole` | String | The candidate's starting role: `Traitor` or `Faithful`. |

### Votes (`data/all_votes.csv`)

| Column | Type | Description |
| :--- | :--- | :--- |
| `series` | Integer | The season number. |
| `voterId` | Integer | ID of the candidate who cast the vote. |
| `targetId` | Integer | ID of the candidate who received the vote. |
| `episode` | Integer | The episode number where the vote took place. |
| `round` | Integer | The round number (often corresponds to episode, but handles double banishments). |

### Key Enumerations

**Role**:
- `Traitor`: A designated traitor.
- `Faithful`: A faithful contestant.

**Status**:
- `Active`: Currently in the game.
- `Banished`: Voted out by the group.
- `Murdered`: Removed by the Traitors.
- `Eliminated`: Removed by other game mechanics.
- `Recruited`: Converted from Faithful to Traitor.
- `Winner`: Won the game.
- `RunnerUp`: Reached the final but did not win.
