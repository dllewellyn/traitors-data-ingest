import express, { Request, Response } from "express";

const app = express();

/**
 * @route GET /
 * @returns {string} "Hello World!"
 */
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

export default app;
