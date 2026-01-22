import express, {Request, Response, NextFunction} from "express";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {runIngestionProcess, Api, Series, Candidate} from "@gcp-adl/core";
import {getAllSeries, getSeriesByNumber, getCandidatesBySeriesNumber} from "./persistence/firestore";

// Initialize Firebase Admin once
initializeApp();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// --- Mappers ---

const mapCandidate = (c: Candidate): Api.components["schemas"]["Candidate"] => {
  const lastState = c.roundStates[c.roundStates.length - 1];
  return {
    id: c.id,
    name: c.name,
    seriesId: c.series,
    role: c.originalRole as "Faithful" | "Traitor",
    outcome: lastState ? lastState.status : "Unknown",
  };
};

const mapSeries = (s: Series): Api.components["schemas"]["Series"] => {
  // Simple year mapping or estimation
  // Series 1: 2022, Series 2: 2024, Series 3: 2025, Series 4: 2025
  const years: Record<number, number> = {1: 2022, 2: 2024, 3: 2025, 4: 2025};
  return {
    id: s.seriesNumber,
    year: years[s.seriesNumber] || 0,
    title: `The Traitors (UK series ${s.seriesNumber})`,
  };
};

// --- API Router ---
const apiRouter = express.Router();

apiRouter.get("/health", (req: Request, res: Response) => {
  res.status(200).send({status: "ok"});
});

// Auth Middleware for Ingest
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authToken = req.headers["x-auth-token"];
  const validToken = process.env.INGEST_TOKEN || "LOCAL_DEV_TOKEN";

  if (!authToken || authToken !== validToken) {
    res.status(401).send({error: "Unauthorized"});
    return;
  }
  next();
};

apiRouter.post("/ingest", authMiddleware, (req: Request, res: Response) => {
  logger.info("Ingestion triggered manually");
  runIngestionProcess(getFirestore())
    .then(() => {
      logger.info("Ingestion completed successfully");
    })
    .catch((err) => {
      logger.error("Ingestion failed", err);
    });
  res.status(202).send({status: "ingestion_started"});
});

// GET /series
apiRouter.get("/series", async (req: Request, res: Response) => {
  try {
    const seriesList = await getAllSeries();
    const response = seriesList.map(mapSeries);
    res.json(response);
  } catch (err) {
    logger.error("Error listing series", err);
    res.status(500).send({error: "Internal Server Error"});
  }
});

// GET /series/:seriesId
apiRouter.get("/series/:seriesId", async (req: Request, res: Response) => {
  try {
    const seriesId = parseInt(req.params.seriesId as string, 10);
    if (isNaN(seriesId)) {
      res.status(400).send({error: "Invalid series ID"});
      return;
    }

    const series = await getSeriesByNumber(seriesId);
    if (!series) {
      res.status(404).send({error: "Series not found"});
      return;
    }

    res.json(mapSeries(series));
  } catch (err) {
    logger.error(`Error getting series ${req.params.seriesId}`, err);
    res.status(500).send({error: "Internal Server Error"});
  }
});

// GET /series/:seriesId/candidates
apiRouter.get("/series/:seriesId/candidates", async (req: Request, res: Response) => {
  try {
    const seriesId = parseInt(req.params.seriesId as string, 10);
    if (isNaN(seriesId)) {
      res.status(400).send({error: "Invalid series ID"});
      return;
    }

    const series = await getSeriesByNumber(seriesId);
    if (!series) {
      res.status(404).send({error: "Series not found"});
      return;
    }

    const candidatesDomain = await getCandidatesBySeriesNumber(seriesId);
    const candidates = candidatesDomain.map(mapCandidate);
    res.json(candidates);
  } catch (err) {
    logger.error(`Error getting candidates for series ${req.params.seriesId}`, err);
    res.status(500).send({error: "Internal Server Error"});
  }
});

// Mount router
app.use("/api", apiRouter);
app.use("/", apiRouter);

// Legacy status endpoint (kept for compatibility if needed, or remove?)
// The original code had /status on root.
app.get("/status", (req: Request, res: Response) => {
  res.status(200).json({status: "ok"});
});

export default app;
