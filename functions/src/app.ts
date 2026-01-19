import express, { Request, Response } from 'express';

const app = express();

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).send({ status: 'ok' });
});

export default app;
