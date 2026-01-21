import { runIngestionProcess } from "@gcp-adl/core";

async function main() {
  await runIngestionProcess();
}

main().catch((err) => {
  console.error("Fatal error during ingestion:", err);
  process.exit(1);
});
