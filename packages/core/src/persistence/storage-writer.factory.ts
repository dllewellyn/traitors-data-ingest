import * as path from "path";
import { Storage } from "@google-cloud/storage";
import { StorageWriter } from "./storage-writer";
import { LocalStorageWriter } from "./local-storage-writer";
import { GcsStorageWriter } from "./gcs-storage-writer";

export function createStorageWriter(): StorageWriter {
  // If FUNCTIONS_EMULATOR is set to true, we are running locally in the emulator.
  // Note: Boolean check on string env var.
  const isEmulator = process.env.FUNCTIONS_EMULATOR === "true";

  if (isEmulator) {
    // When running in Firebase Emulator, we want to write to the data/ directory
    // which is served by Firebase Hosting.
    // If process.cwd() is the functions directory, data is at ../data
    // If process.cwd() is the root, data is at ./data
    let dataDir = path.join(process.cwd(), "data");

    if (path.basename(process.cwd()) === "functions") {
      dataDir = path.join(process.cwd(), "../data");
    }

    console.log(`Using LocalStorageWriter writing to: ${dataDir}`);
    return new LocalStorageWriter(dataDir);
  } else {
    // In production, we use Google Cloud Storage
    const storage = new Storage();
    // TODO: Make bucket name configurable via secrets/config
    const bucketName = process.env.GCS_BUCKET || "traitors-api-data";
    const bucket = storage.bucket(bucketName);

    console.log(`Using GcsStorageWriter writing to bucket: ${bucketName}`);
    return new GcsStorageWriter(bucket);
  }
}
