import { PipelineOrchestrator } from "../services/PipelineOrchestrator";

async function main() {
  const orchestrator = new PipelineOrchestrator();
  await orchestrator.run();
}

main().catch((err) => {
  console.error("Fatal error during ingestion:", err);
  process.exit(1);
});
