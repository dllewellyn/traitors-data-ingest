import { Firestore, getFirestore } from "firebase-admin/firestore";
import { IStorageWriter } from "./IStorageWriter";
import { DryRunStorageWriter } from "./DryRunStorageWriter";
import { FirestoreStorageWriter } from "./firestore-writer";

export interface StorageWriterOptions {
  firestore?: Firestore;
  dryRun?: boolean;
}

/**
 * Creates a storage writer instance based on the provided options.
 * Defaults to FirestoreStorageWriter if dryRun is not true.
 * @param options Configuration options for the storage writer.
 */
export function createStorageWriter(options: StorageWriterOptions = {}): IStorageWriter {
  if (options.dryRun) {
    return new DryRunStorageWriter();
  }

  const db = options.firestore || getFirestore();
  return new FirestoreStorageWriter(db);
}
