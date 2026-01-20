import express, {Request, Response, NextFunction} from "express";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/status", (req: Request, res: Response) => {
  res.status(200).json({status: "ok"});
});

// Auth Middleware
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  // Default for local testing
  const token = process.env.INGEST_TOKEN || "local-dev-token";

  if (!authHeader || authHeader !== `Bearer ${token}`) {
    res.status(401).send({error: "Unauthorized"});
    return;
  }
  next();
};

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).send({status: "ok"});
});

app.post("/api/ingest", authMiddleware, (req: Request, res: Response) => {
  // In a real implementation, this would trigger the ingestion logic.
  // For Phase 0 (Infrastructure), we confirm the trigger works.
  // TODO: Integrate actual ingestion logic in Phase 3.
  // eslint-disable-next-line no-console
  console.log("Ingestion triggered manually");
  res.status(200).send({status: "ingestion started", mode: "manual"});
});

export default app;
