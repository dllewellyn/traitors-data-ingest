import * as path from "path";
import { runIngestionProcess, LocalStorageWriter } from "@gcp-adl/core";

async function main() {
  // src/scripts/ingest.ts -> root/src/scripts
  // data dir is root/data
  const dataDir = path.join(__dirname, "../../data");
  console.log(`Running ingestion to local storage at: ${dataDir}`);

  const writer = new LocalStorageWriter(dataDir);
  await runIngestionProcess(writer);
}

main().catch((err) => {
  console.error("Fatal error during ingestion:", err);
  process.exit(1);
});
