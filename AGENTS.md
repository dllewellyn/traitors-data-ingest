# Agent Memory & Performance

## Local Development Setup

To run the project locally with the Firebase Emulator Suite, follow these steps:

1.  **Prerequisites**: Ensure you have Node.js 20.x, npm, and the Firebase CLI installed (`npm install -g firebase-tools`).
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
    This will also install dependencies for the `functions` directory via the `postinstall` hook.
3.  **Start Emulators**:
    ```bash
    npm run emulate
    ```
    This command builds the functions and starts the emulator suite.
    - **Hosting**: `http://localhost:5000` (Serves CSVs from `data/` and proxies `/api` requests)
    - **Functions**: `http://localhost:5001` (Direct access to Cloud Functions)
    - **Emulator UI**: `http://localhost:4000` (Logs and management interface)
4.  **Manual Ingestion Trigger**:
    To manually trigger data ingestion during development:
    ```bash
    npm run trigger:local
    ```
    This sends an authenticated POST request to `http://localhost:5001/.../api/ingest` using the `LOCAL_DEV_TOKEN`.

## Lessons Learned
- **2026-01-15**: System initialized.
- **2026-01-15**: Constitution ratified: Enforcing strict TypeScript, >90% test coverage, and Conventional Commits for all contributions.
- **2026-01-15**: Explicitly document the status of ongoing objectives in GOALS.md to provide clear visibility into-progress versus completed scope.
- **2026-01-15**: Enforce consistent formatting in documentation files, such as ensuring trailing newlines, to maintain clean version control diffs.
- **2026-01-15**: Avoid committing internal planning notes or scratchpad text to project documentation files like TASKS.md to maintain clarity and focus.
- **2026-01-15**: Decouple Express application configuration (`src/app.ts`) from server startup (`src/index.ts`) to enable efficient integration testing with Supertest.
- **2026-01-15**: Adopt multi-stage Docker builds to ensure lightweight production images while maintaining a full-featured development environment.
- **2026-01-15**: Maintain a strict separation between data transfer objects (e.g., CSV row interfaces) and core domain models to facilitate clean data transformation and validation logic.
- **2026-01-15**: When modeling entities with temporal state changes, encapsulate state history within the entity (e.g., `roundStates`) to enable historical analysis.
- **2026-01-16**: Implement comprehensive type guards for parsing and validating untrusted external data, ensuring data integrity and system stability.
- **2026-01-16**: Thoroughly test utility functions, especially type guards, to guarantee their correctness and robustness across various data types and edge cases.
- **2026-01-16**: Develop dedicated, well-tested utility functions for common data transformations (e.g., normalization) to ensure data consistency and reduce redundancy across the codebase.
- **2026-01-16**: Implement robust data normalization logic to handle variations in input data, such as removing extraneous information (e.g., annotations like '[a]', '[b]' from names) and standardizing formats (e.g., ISO 8601 for dates).
- **2026-01-16**: Structure the project as a monorepo with local packages linked via `file:` protocol to enforce modularity and separation of concerns.
- **2026-01-16**: Automate the build process for local packages using a custom script invoked via the `prebuild` hook to ensure dependencies are compiled before the main application.
- **2026-01-16**: Verify the integration of local packages using dedicated test suites to ensure correct dependency resolution and module exports.
- **2026-01-16**: Wrap external libraries (e.g., HTML parsers) behind domain-specific interfaces and type aliases to decouple the application code from specific implementation details.
- **2026-01-16**: Implement exponential backoff retry strategies for external network calls to handle transient failures gracefully and avoid overwhelming remote servers.
- **2026-01-16**: Use custom error classes to wrap low-level infrastructure errors (e.g., network failures), providing semantic meaning to exceptions for better upstream handling.
- **2026-01-16**: Implement fault-tolerant parsing logic that skips malformed data rows (logging warnings) rather than aborting the entire process, ensuring maximum data recovery.
- **2026-01-16**: Locate HTML tables relative to semantic headings (e.g., finding an `h2` and selecting the next `table`) to improve resilience against minor layout changes compared to absolute CSS selectors.
- **2026-01-16**: When a dedicated logging infrastructure is missing, use standard console methods with explicit linting suppressions (`eslint-disable-next-line no-console`) to maintain visibility into non-fatal errors during development.
- **2026-01-16**: Define generic interfaces (e.g., `TableParser<T>`) for common parsing operations to promote consistency and interchangeability of implementations.
- **2026-01-16**: Utilize `csv-stringify` for robust CSV generation, ensuring proper handling of special characters (quotes, newlines) and header management.
- **2026-01-16**: When implementing file writers, always ensure the target directory exists (`fs.mkdir({ recursive: true })`) before attempting to write to avoid `ENOENT` errors.
- **2026-01-16**: Verify file system operations with integration tests that cover edge cases like deep directory structures, empty datasets, and special character escaping.
- **2026-01-16**: Isolate file system tests by using dedicated temporary directories and ensuring cleanup (`fs.rm({ recursive: true, force: true })`) to prevent state leakage.
- **2026-01-16**: Utilize regular expressions with non-greedy captures and optional groups to robustly extract structured data from composite strings.
- **2026-01-16**: Design parsing utilities to return `null` for unparseable inputs instead of throwing exceptions, forcing the consumer to explicitly handle invalid data.
- **2026-01-16**: Provide safe default values (e.g., `0`) when parsing optional numeric fields to maintain type safety when source data is missing.
- **2026-01-16**: Use explicit linting suppressions (` @typescript-eslint/no-explicit-any`) in tests when verifying runtime resilience against invalid types.
- **2026-01-16**: When parsing complex HTML tables with merged cells, implement explicit state tracking for `rowspan` and `colspan` (e.g., using a `pendingSpans` buffer) to correctly map values to the underlying grid.
- **2026-01-16**: Employ heuristic filtering with keyword blocklists to distinguish valid data rows from embedded metadata or sub-headers within loosely structured HTML tables.
- **2026-01-16**: Centralize domain status mapping in normalizers to handle synonyms and infer default states from ambiguous cell content (e.g., treating voting records as "Safe").
- **2026-01-17**: Adopt a hybrid data persistence model: commit CSV snapshots to the repository for auditability and transparency, while leveraging cloud storage for automated, scheduled data ingestion pipelines.
- **2026-01-17**: Configure test runners (e.g., Jest) to discover tests in both source (`src/`) and dedicated test directories (`tests/`) to support separated unit and integration test strategies.
- **2026-01-17**: Implement snapshot-based integration tests for data scrapers using local HTML fixtures and "golden" output files (e.g., CSVs) to ensure deterministic and accurate end-to-end validation.
- **2026-01-17**: Enhance regex patterns in parsers to robustly handle and strip optional trailing metadata or citation markers (e.g., `[a]`) to prevent data pollution.
- **2026-01-17**: Use strategy-based mocks (e.g., `FileBasedFetcher`) in integration tests to decouple execution from external network dependencies while maintaining realistic input data.
- **2026-01-17**: Explicitly flatten complex nested data structures (e.g., JSON objects) into string representations before serializing to CSV to ensure output validity and readability.
- **2026-01-17**: Encapsulate specialized parsing logic for distinct data sources (e.g., candidates vs. progress) within a Facade class to provide a unified and simplified interface for data retrieval.
- **2026-01-17**: Dynamically analyze table structures at runtime—such as scanning for specific header rows or mapping columns to logical keys—to robustly handle variable layouts instead of relying on fixed indices.
- **2026-01-17**: When expanding domain enums, explicitly audit negative conditional logic (e.g., "if not a known status, treat as value") to prevent new enum members from being misclassified.
- **2026-01-17**: Create dedicated NPM scripts for distinct data ingestion tasks (e.g., `ingest:series4`) to encapsulate specific configurations and simplify execution.
- **2026-01-17**: When parsing tables with mixed `colspan` attributes, calculate the logical column index by summing the `colspan` of all preceding sibling elements to ensure accurate data alignment.
- **2026-01-18**: Inject context identifiers (e.g., `series` ID) immediately at the scraping layer to ensure data provenance is maintained when aggregating multiple sources.
- **2026-01-18**: Implement a tiered entity resolution strategy (Full Name -> Nickname extraction -> First Name fallback) when linking loose text references to domain entities.
- **2026-01-18**: When parsing fields containing mixed data types (e.g., votes and statuses), explicitly filter against a comprehensive blocklist of reserved values to isolate valid data.
- **2026-01-18**: Defer complex semantic resolution (e.g., name-to-ID mapping) to a dedicated service layer that has access to the full dataset, rather than attempting it within isolated parsers.
- **2026-01-18**: Orchestrate multi-source data ingestion using parallel execution (`Promise.all`) followed by a centralized merge step to optimize performance and ensure consistency.
- **2026-01-18**: Implement a dedicated data validation CLI (e.g., `src/cli/validate.ts`) to run post-ingestion checks, ensuring referential integrity (e.g., no orphaned votes) and logical consistency (e.g., unique IDs) across generated datasets.
- **2026-01-18**: Use a robust CSV parsing library (e.g., `csv-parse`) with automatic type casting to accurately restore typed data (numbers, booleans) from string-based storage formats.
- **2026-01-18**: When designing data access services, gracefully handle missing files (e.g., returning empty arrays on `ENOENT`) to allow the system to bootstrap or run in partial states without crashing.
- **2026-01-18**: Integrate end-to-end data verification steps (ingestion and validation) into the CI pipeline to guarantee that code changes do not degrade data quality or scraping reliability.
- **2026-01-18**: Maintain a live Data Dictionary within the project root documentation (`README.md`) to define schemas and enumerations clearly for users and automated tools.
- **2026-01-18**: Implement self-updating data pipelines using GitHub Actions with `contents: write` permissions to scrape, validate, and commit dataset changes directly to the repository.
- **2026-01-18**: In CI/CD workflows that persist data, explicitly check for file changes (e.g., `git status --porcelain`) before committing to avoid failures caused by empty commits.
- **2026-01-19**: When deploying serverless applications to Firebase, maintain a hybrid approach: use Firebase Hosting for static assets (CDN-backed CSV files), Cloud Functions for API endpoints, and GitHub Actions for data ingestion to preserve git-based auditability.
- **2026-01-19**: Structure Firebase deployments to leverage existing infrastructure rather than replacing it—keep proven workflows (GitHub Actions) while adding cloud capabilities (Hosting, Functions) incrementally.
- **2026-01-19**: For monorepo projects with local package dependencies, ensure Firebase Functions build process includes prebuild steps to compile local packages before function deployment.
- **2026-01-19**: Document cloud deployment strategies comprehensively in project governance files (GOALS.md, TASKS.md) to maintain clear visibility into infrastructure decisions and implementation roadmap.
- **2026-01-19**: Before deploying to Firebase production, establish a complete local testing infrastructure using Firebase Emulator Suite to validate functions, hosting, and integrations without incurring costs or affecting production.
- **2026-01-19**: Implement manual trigger endpoints (e.g., `/api/ingest`) for data operations to enable on-demand testing and debugging during development, separate from automated scheduled workflows.
- **2026-01-19**: Treat Firebase emulator testing as a mandatory gate—no deployment to production should occur without successful local emulator validation of all functions and hosting configurations.
- **2026-01-19**: Establish a local emulator workflow for Firebase Functions by decoupling the Express app into a dedicated directory (`functions/`) with its own dependency tree, while using root-level scripts (`npm run emulate`) and `firebase.json` rewrites to integrate it seamlessly with Hosting.
- **2026-01-19**: Abstract complex multi-step development environment setup commands (like building dependencies and starting emulators with specific flags) into single, declarative NPM scripts (e.g., `"emulate": "npm run build --prefix functions && firebase emulators:start..."`). This ensures consistency, reduces cognitive load for developers, and minimizes "it works on my machine" errors caused by missed steps.
- **2026-01-20**: Finalized the Local Testing Workflow by enforcing a strict directory structure (`functions/` for backend, `data/` for hosting), validating Node.js 20.x compatibility for Firebase Runtime, and confirming hot-reload capabilities via `npm run build` triggering emulator updates.
- **2026-01-20**: Managed project dependencies by removing unused root-level packages (Express, Nodemon) and ensuring `postinstall` hooks automatically install nested `functions` dependencies to maintain a ready-to-code environment.
- **2026-01-20**: Refactored core ingestion logic into a shared package (` @gcp-adl/core`) to enable reuse across CLI tools and Cloud Functions without code duplication, enforcing a cleaner separation of concerns.
- **2026-01-21**: For long-running background tasks initiated via HTTP triggers (e.g., data ingestion), return a `202 Accepted` status immediately and execute the task asynchronously to prevent client timeouts and improve API responsiveness.
- **2026-01-21**: Utilize platform-native logging libraries (e.g., `firebase-functions/logger`) in serverless functions to ensure proper log routing, severity levels, and integration with cloud monitoring tools.
- **2026-01-21**: Employ hosting rewrites (e.g., in `firebase.json`) to proxy a clean API path (like `/api/**`) to the underlying serverless function, decoupling the public URL from the function's trigger name.
- **2026-01-21**: Secure internal or development-only endpoints with a simple, shared secret passed in a custom header (e.g., `X-Auth-Token`) as a lightweight alternative to complex user authentication schemes.
- **2026-01-21**: Configure test runners (e.g., Jest) to explicitly ignore compiled output directories (e.g., `dist/`) in both `testPathIgnorePatterns` and `coveragePathIgnorePatterns` to prevent test conflicts and ensure accurate coverage metrics.
- **2026-01-21**: Regularly update third-party dependencies and commit the resulting lockfile changes to ensure the project incorporates upstream security patches and bug fixes, maintaining a secure and stable baseline.
- **2026-01-21**: Implement a storage abstraction (Strategy Pattern) using a generic interface (e.g., `StorageWriter`) with concrete implementations for different environments (e.g., `LocalStorageWriter`, `GcsStorageWriter`). Use a factory to select the implementation at runtime based on environment variables, decoupling core logic from the file system.
- **2026-01-21**: Utilize Dependency Injection by providing I/O dependencies (like a `StorageWriter`) to services via their constructor, which enables easier testing and environment-specific configuration.
- **2026-01-21**: Isolate integration tests from external services by mocking the core module (e.g., ` @gcp-adl/core`) and verifying that its functions are called, rather than testing the side-effects of the entire downstream process.
- **2026-01-22**: Pivot from a file-based data pipeline (CSV, GCS) to a database-centric model (Cloud Firestore) when evolving from a data auditing system to a scalable, live, API-driven platform.
- **2026-01-22**: Adopt an OpenAPI-first methodology to establish a clear, design-by-contract approach for API development, enabling automated code generation and ensuring consistency between the implementation and its documentation.
- **2026-01-22**: When making significant architectural changes, update all high-level governance and planning documents (Constitution, Goals, Context Maps) in lockstep with the codebase to maintain clarity and strategic alignment.
- **2026-01-22**: Regularly audit and remove unused local packages and external dependencies to reduce build complexity, simplify the codebase, and eliminate dead code.
- **2026-01-22**: Execute an API-first strategy by creating a comprehensive OpenAPI specification that defines all core resources (Series, Candidates), schemas, and endpoints, establishing a clear public contract before beginning implementation.
- **2026-01-22**: Automate the synchronization of the API contract and the codebase by integrating an OpenAPI-to-TypeScript generation step (e.g., using `openapi-typescript`) into the `prebuild` script, ensuring that generated types are treated as build artifacts and excluded from source control.
- **2026-01-22**: When integrating a new Firebase service (e.g., Firestore), initialize its configuration files (`firestore.rules`, `firestore.indexes.json`) with secure defaults (e.g., deny-all rules) and add its corresponding emulator to `firebase.json` to ensure a consistent and secure local development environment.
- **2026-01-22**: Utilize atomic batch writes (e.g., Firestore's `WriteBatch`) when persisting a collection of related documents to ensure data integrity and prevent partial updates.
- **2026-01-22**: In NoSQL databases, generate deterministic, human-readable document IDs (e.g., by combining a parent ID with a sanitized business key) to ensure idempotency on repeated ingestion and simplify direct data lookups.
- **2026-01-22**: Denormalize relationships in Firestore by embedding parent document IDs (e.g., `seriesId`) into child documents to enable efficient querying without requiring joins.
- **2026-01-22**: When unit testing database repositories, mock the database client and batch objects to verify interactions and logic without requiring a live database connection, ensuring fast and isolated tests.
- **2026-01-22**: Define aggregate root models (e.g., a `Series` object containing `Candidates` and `Votes`) to encapsulate related data and provide a clean, unified interface for high-level operations like persistence.
- **2026-01-22**: Use environment variables as feature flags to conditionally enable major infrastructure changes (like a new database writer), allowing for gradual rollout and isolated testing of different system configurations.
- **2026-01-22**: Implement the Repository Pattern by creating a dedicated persistence layer (`functions/src/persistence/firestore.ts`) to encapsulate all database query logic, decoupling the API handlers from the underlying Firestore implementation.
- **2026-01-22**: Use dedicated mapper functions to transform internal domain models into public API Data Transfer Objects (DTOs), decoupling the public API contract from the internal database schema.
- **2026-01-22**: When implementing API endpoints, perform robust validation of path parameters and user-provided inputs, returning specific HTTP error codes (e.g., 400 Bad Request) to provide clear feedback to clients.
- **2026-01-22**: Enhance testability by using Dependency Injection; for example, passing a Firestore instance to core logic (`runIngestionProcess`) allows it to be easily mocked or replaced in different environments.
- **2026-01-22**: Write comprehensive API tests that cover not only successful (2xx) responses but also client errors (4xx) and server errors (5xx) to ensure the API is robust and behaves predictably.
- **2026-01-22**: Proactively define composite Firestore indexes (e.g., in `firestore.indexes.json`) to support critical query patterns, such as filtering by a parent ID while ordering by a key attribute. This treats performance-critical database configuration as version-controlled code, ensuring scalability and consistency across environments.
- **2026-01-22**: Encapsulate one-time data migration logic within a dedicated, orchestrating service (e.g., `LegacyMigrationService`). This service is responsible for the end-to-end process of reading, transforming, and writing data, making the migration a repeatable and testable operation.
- **2026-01-22**: When migrating data from a loosely-structured format (like CSVs with embedded JSON) to a strongly-typed model, implement a clear separation between raw data interfaces and domain models. Use type guards and explicit validation steps during the transformation to ensure data integrity.
- **2026-01-22**: Structure command-line scripts and their underlying services using Dependency Injection. Providing dependencies like readers and writers to a service's constructor allows for robust unit testing with mocks, independent of live databases or file systems.
- **2026-01-22**: Design operational CLI scripts to be environment-aware by accepting command-line flags (e.g., `--emulator`). This allows the same script to safely target different environments, such as a local emulator or a production database, without code changes.
- **2026-01-22**: Implement a robust security model for public-facing databases by establishing a 'default deny' policy for writes while allowing global public read access. Grant write permissions exclusively to authenticated service accounts (`request.auth != null`) to ensure that only trusted processes can modify data.
- **2026-01-22**: Abstract data-access logic behind a generic interface (the Strategy Pattern) with concrete implementations for each data source (e.g., `CsvValidationReader`, `FirestoreValidationReader`). This decouples consumers from the underlying storage mechanism, allowing different sources to be used interchangeably.
- **2026-01-22**: Enhance operational CLI scripts to be environment-aware by accepting flags (e.g., `--source`) to select behavior and checking environment variables (e.g., `FIRESTORE_EMULATOR_HOST`) to configure connections, making them flexible tools for development and testing against different backends.
- **2026-01-22**: Isolate data transfer objects (DTOs) used across multiple layers (e.g., `CandidateRow` for validation) into a shared domain definition file, preventing the duplication of data structures and decoupling services from each other.
- **2026-01-22**: When testing data repository implementations, mock the low-level database client and inject it into the repository class. This allows for fast, isolated unit tests that verify data mapping and transformation logic without the overhead of a live database connection.
- **2026-01-22**: Implement a 'dry run' mode for critical data operations by passing a flag to core services. This allows for end-to-end validation of logic without side effects, significantly improving safety and developer confidence during testing and debugging.
- **2026-01-22**: Decouple application logic from persistence details by abstracting I/O operations behind a generic interface (the Strategy Pattern). This allows for interchangeable backends (e.g., a live database writer vs. a 'dry run' console writer) and enhances testability by enabling dependency injection.
- **2026-01-22**: Provide command-line interfaces (CLIs) with clear, documented flags (e.g., using `yargs`) to control the behavior of operational scripts, making complex features like 'dry run' modes or environment targeting discoverable and easy for developers to use.
- **2026-01-22**: To achieve high-fidelity integration testing for cloud-native applications, execute the test suite within a CI pipeline that runs emulated services (e.g., `firebase emulators:exec`). This validates the application's behavior against a realistic environment, including interactions with emulated databases and serverless functions.
- **2026-01-22**: When using service emulators in CI, ensure the workflow installs all necessary underlying dependencies (e.g., a specific Java version for the Firestore emulator) to prevent environment-related test failures.
- **2026-01-22**: Explicitly configure the application to connect to emulated services during CI tests by setting environment variables (e.g., `FIRESTORE_EMULATOR_HOST`), which isolates the test environment and prevents accidental connections to live resources.
- **2026-01-22**: Integrate database configuration management (e.g., Firestore rules and indexes) into the CI/CD pipeline. By using tools like the Firebase CLI with service account credentials stored in CI secrets, deployments can be automated on merges to the main branch, ensuring that production infrastructure is treated as version-controlled code and preventing configuration drift.
- **2026-01-22**: As a system's purpose evolves from data auditing to a live service, pivot the core data pipeline away from file-based outputs (like CSVs) to a scalable database backend (like Firestore) to eliminate intermediate storage layers and support real-time API queries.
- **2026-01-22**: Aggressively remove obsolete code and dependencies when making major architectural shifts. Deleting entire modules (e.g., file-based writers, CSV generators) simplifies the codebase, reduces maintenance overhead, and clarifies the system's current strategy.
- **2026-01-22**: Refactor factory functions to accept explicit configuration objects (e.g., `{ dryRun: boolean, firestore: instance }`) instead of relying on implicit environment variables. This improves testability, makes dependency injection clearer, and enhances the predictability of the code.
- **2026-01-22**: In data ingestion pipelines that process multiple independent sources, wrap each source's processing logic in a `try/catch` block. This prevents a single failure from halting the entire operation, maximizing data recovery and improving system resilience.
- **2026-01-22**: Instead of failing silently or throwing errors on recoverable data integrity issues (e.g., an unmatchable foreign key during a merge), log detailed warnings. This improves observability and allows the main process to continue while flagging data for later review.
- **2026-01-22**: Serve an OpenAPI specification via static hosting and render it using Swagger UI to provide live, interactive API documentation directly from the application, making the API contract discoverable and testable for consumers.
- **2026-01-22**: Use an end-to-end testing framework (e.g., Playwright) with a `webServer` configuration to automatically start the entire application stack, including emulators, before running tests. This ensures E2E tests validate the full, integrated system as it would run in production.
- **2026-01-22**: Transition from custom package build scripts to native package manager features (e.g., NPM Workspaces) to simplify the monorepo build process, improve reliability, and align with industry-standard practices.
- **2026-01-22**: Implement end-to-end tests that verify not only that the API documentation page loads but also that the underlying specification file is accessible and correct, treating documentation as a first-class, testable artifact.