import { runIngestionProcess, LocalStorageWriter } from "@gcp-adl/core";
import * as path from "path";

async function main() {
  const dataDir = path.join(process.cwd(), "data");
  const writer = new LocalStorageWriter(dataDir);
  await runIngestionProcess(writer);
}

main().catch((err) => {
  console.error("Fatal error during ingestion:", err);
  process.exit(1);
});
