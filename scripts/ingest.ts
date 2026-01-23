import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { runIngestionProcess } from '../packages/core/src/ingestion/orchestrator';
import { FirestoreStorageWriter } from '../packages/core/src/persistence/firestore-writer';

/**
 * Initializes the Firebase Admin SDK.
 * In a production Google Cloud environment (like GitHub Actions),
 * the SDK automatically uses the environment's service account credentials.
 */
function initializeFirebase() {
  console.log('Initializing Firebase Admin SDK...');
  initializeApp();
}

/**
 * Main function to run the data ingestion process.
 */
async function main() {
  try {
    initializeFirebase();

    const firestore = getFirestore();
    console.log('Firestore instance retrieved.');

    // As per AGENTS.md, use a factory to select the writer.
    // For the CI script, we directly instantiate the production writer.
    const writer = new FirestoreStorageWriter(firestore);

    console.log('Starting data ingestion process...');
    // The orchestrator logic is reused from packages/core/, as per CONTEXT_MAP.md
    await runIngestionProcess({
      storageWriter: writer,
      series: [1, 2, 3, 4], // Ingest all available series
    });

    console.log('Data ingestion process completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('An error occurred during the ingestion process:', error);
    process.exit(1);
  }
}

main();
