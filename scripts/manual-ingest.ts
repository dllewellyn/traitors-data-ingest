import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { runIngestionProcess } from '../packages/core/src/ingestion/orchestrator';
import { createStorageWriter } from '../packages/core/src/persistence/storage-writer-factory';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

/**
 * Initializes the Firebase Admin SDK.
 */
function initializeFirebase() {
  console.log('Initializing Firebase Admin SDK...');
  initializeApp();
}

/**
 * Main function to run the manual data ingestion process.
 */
async function main() {
  try {
    const argv = await yargs(hideBin(process.argv))
      .option('series', {
        type: 'string',
        description: 'Comma-separated list of series IDs to ingest (e.g., "1,3")',
      })
      .option('dry-run', {
        type: 'boolean',
        default: false,
        description: 'Run validation without writing to Firestore',
      })
      .help()
      .argv;

    initializeFirebase();
    const db = getFirestore();

    const dryRun = argv['dry-run'];
    const seriesInput = argv.series;

    // Parse series IDs
    let seriesIds: number[] | undefined;
    if (seriesInput) {
      seriesIds = seriesInput.split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));

      if (seriesIds.length > 0) {
        console.log(`Targeting series: ${seriesIds.join(', ')}`);
      } else {
        console.warn('Series filter provided but no valid IDs found.');
      }
    } else {
      console.log('Targeting all available series.');
    }

    console.log(`Mode: ${dryRun ? 'DRY RUN' : 'PRODUCTION WRITE'}`);

    const writer = createStorageWriter({
      dryRun: dryRun,
      firestore: db,
    });

    await runIngestionProcess({
      storageWriter: writer,
      series: seriesIds,
      dryRun: dryRun,
      firestoreInstance: db
    });

    console.log('Manual ingestion process completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('An error occurred during the manual ingestion process:', error);
    process.exit(1);
  }
}

main();
