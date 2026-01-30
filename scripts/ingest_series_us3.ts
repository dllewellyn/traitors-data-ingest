import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { runIngestionProcess } from "../packages/core/src/ingestion/orchestrator";
import { FirestoreStorageWriter } from "../packages/core/src/persistence/firestore-writer";

/**
 * Initializes the Firebase Admin SDK.
 */
function initializeFirebase() {
  console.log("Initializing Firebase Admin SDK...");
  initializeApp();
}

/**
 * Main function to run the data ingestion process for US Series 3.
 */
async function main() {
  try {
    initializeFirebase();

    const firestore = getFirestore();
    console.log("Firestore instance retrieved.");

    const writer = new FirestoreStorageWriter(firestore);

    console.log("Starting US Series 3 ingestion process...");
    await runIngestionProcess({
      storageWriter: writer,
      seriesIds: ["TRAITORS_US_S3"],
    });

    console.log("US Series 3 ingestion process completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("An error occurred during the ingestion process:", error);
    process.exit(1);
  }
}

main();
