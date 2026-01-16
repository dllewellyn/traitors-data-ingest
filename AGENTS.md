# Agent Memory & Performance
## Lessons Learned
- **2026-01-15**: System initialized.
- **2026-01-15**: Constitution ratified: Enforcing strict TypeScript, >90% test coverage, and Conventional Commits for all contributions.
- **2026-01-15**: Explicitly document the status of ongoing objectives in GOALS.md to provide clear visibility into in-progress versus completed scope.
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