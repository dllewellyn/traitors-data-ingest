import * as path from "path";
import { StorageWriter } from "./storage-writer";
import { LocalStorageWriter } from "./local-storage-writer";

export function createStorageWriter(): StorageWriter {
  // If explicitly requested to use local storage (e.g. for local scripts) OR if running in emulator
  if (process.env.USE_LOCAL_STORAGE === "true" || process.env.FUNCTIONS_EMULATOR === "true") {
    // In emulator, process.cwd() is usually the functions directory.
    // We want to write to the root data directory.
    let baseDir = path.join(process.cwd(), "data");
    if (process.cwd().endsWith("functions")) {
      baseDir = path.join(process.cwd(), "../data");
    }
    return new LocalStorageWriter(baseDir);
  } else {
    throw new Error("GCS Storage is no longer supported. Please use Firestore.");
  }
}
