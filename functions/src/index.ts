import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// Mount the router at the root and at /api to handle both direct function access and hosting rewrites
app.use("/", router);
app.use("/api", router);

export const api = functions.https.onRequest(app);
