import express, {Request, Response, NextFunction} from "express";
import * as logger from "firebase-functions/logger";
import {runIngestionProcess} from "@gcp-adl/core";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/status", (req: Request, res: Response) => {
  res.status(200).json({status: "ok"});
});

// Auth Middleware
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authToken = req.headers["x-auth-token"];
  // Default for local testing
  const validToken = process.env.INGEST_TOKEN || "LOCAL_DEV_TOKEN";

  if (!authToken || authToken !== validToken) {
    res.status(401).send({error: "Unauthorized"});
    return;
  }
  next();
};

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).send({status: "ok"});
});

app.post("/api/ingest", authMiddleware, (req: Request, res: Response) => {
  logger.info("Ingestion triggered manually");

  // Do not await, run in background
  runIngestionProcess()
    .then(() => {
      logger.info("Ingestion completed successfully");
    })
    .catch((err) => {
      logger.error("Ingestion failed", err);
    });

  res.status(202).send({status: "ingestion_started"});
});

export default app;
