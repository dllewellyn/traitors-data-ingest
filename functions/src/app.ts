import express, {Request, Response, NextFunction} from "express";
import * as logger from "firebase-functions/logger";
import {runIngestionProcess} from "@gcp-adl/core";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

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

// --- API Endpoints for Firestore ---

// GET /series
app.get("/series", async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("series").get();
    const series = snapshot.docs.map((doc) => doc.data());
    res.status(200).json(series);
  } catch (error) {
    logger.error("Error fetching series", error);
    res.status(500).json({error: "Internal Server Error"});
  }
});

// GET /series/{seriesId}
app.get("/series/:seriesId", async (req: Request, res: Response) => {
  try {
    const seriesId = req.params.seriesId;
    const seriesRef = db.collection("series").where("id", "==", parseInt(seriesId));
    const snapshot = await seriesRef.get();

    if (snapshot.empty) {
      res.status(404).json({error: "Series not found"});
      return;
    }

    res.status(200).json(snapshot.docs[0].data());
  } catch (error) {
    logger.error("Error fetching series details", error);
    res.status(500).json({error: "Internal Server Error"});
  }
});

// GET /series/{seriesId}/candidates
app.get("/series/:seriesId/candidates", async (req: Request, res: Response) => {
  try {
    const seriesId = req.params.seriesId;
    const candidatesRef = db.collection("candidates").where("seriesId", "==", parseInt(seriesId));
    const snapshot = await candidatesRef.get();

    const candidates = snapshot.docs.map((doc) => doc.data());
    res.status(200).json(candidates);
  } catch (error) {
    logger.error("Error fetching candidates for series", error);
    res.status(500).json({error: "Internal Server Error"});
  }
});

// GET /candidates/{candidateId}
app.get("/candidates/:candidateId", async (req: Request, res: Response) => {
  try {
    const candidateId = req.params.candidateId;
    // Assuming 'id' is the field name in Firestore, not the doc ID
    const candidatesRef = db.collection("candidates").where("id", "==", parseInt(candidateId));
    const snapshot = await candidatesRef.get();

    if (snapshot.empty) {
      res.status(404).json({error: "Candidate not found"});
      return;
    }

    res.status(200).json(snapshot.docs[0].data());
  } catch (error) {
    logger.error("Error fetching candidate details", error);
    res.status(500).json({error: "Internal Server Error"});
  }
});

export default app;
