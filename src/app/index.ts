import cors from "cors";
import express from "express";
import { errorHandler } from "../middleware/errorHandler";
import { requestLogger } from "../middleware/requestLogger";
import { apiRouter } from "../routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(apiRouter);
app.use(errorHandler);

export { app };
