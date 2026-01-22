import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as path from "path";
import {
  CsvReader,
  DataMerger,
  FirestoreStorageWriter,
  LegacyMigrationService,
} from "@gcp-adl/core";

async function main() {
  const args = process.argv.slice(2);
  const isEmulator = args.includes("--emulator");
  const projectIndex = args.indexOf("--project");
  const projectId = projectIndex !== -1 ? args[projectIndex + 1] : undefined;

  if (isEmulator) {
    console.log("Running in emulator mode...");
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
    process.env.GCLOUD_PROJECT = "demo-test";
    initializeApp({ projectId: "demo-test" });
  } else {
    console.log("Running in production mode...");
    if (projectId) {
      console.log(`Targeting project: ${projectId}`);
      initializeApp({ projectId });
    } else {
      console.log(
        "No project ID specified. Using default credentials/project."
      );
      initializeApp();
    }
  }

  const db = getFirestore();
  const writer = new FirestoreStorageWriter(db);
  const reader = new CsvReader();
  const merger = new DataMerger();
  const service = new LegacyMigrationService(reader, merger, writer);

  const seriesList = [1, 2, 3, 4];

  for (const seriesNum of seriesList) {
    console.log(`Migrating Series ${seriesNum}...`);
    try {
      const dataDir = path.join(process.cwd(), "data", `series${seriesNum}`);
      await service.migrateSeries(seriesNum, dataDir);
      console.log(`Successfully migrated Series ${seriesNum}.`);
    } catch (error) {
      console.error(`Failed to migrate Series ${seriesNum}:`, error);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
