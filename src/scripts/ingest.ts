import { runIngestionProcess } from "@gcp-adl/core";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

async function main() {
  const argv = await yargs(hideBin(process.argv)).option("dry-run", {
    alias: "d",
    type: "boolean",
    description: "Run the ingestion process without writing to the database",
    default: false,
  }).argv;

  await runIngestionProcess({ dryRun: argv["dry-run"] });
}

main().catch((err) => {
  console.error("Fatal error during ingestion:", err);
  process.exit(1);
});
