import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { PipelineOrchestrator } from "../../src/services/PipelineOrchestrator";
import { GcsAdapter } from "../../src/infrastructure/storage/GcsAdapter";

// Define the bucket name via environment variable or default
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || "my-data-bucket";

export const scheduledScraper = onSchedule("every 24 hours", async (event) => {
  logger.info("Starting scheduled scraper...", { event });

  try {
    const storage = new GcsAdapter(BUCKET_NAME);
    const orchestrator = new PipelineOrchestrator(storage);
    await orchestrator.run();
    logger.info("Scheduled scraper completed successfully.");
  } catch (error) {
    logger.error("Error during scheduled scraper execution:", error);
    throw error; // Rethrow to mark function execution as failed
  }
});
