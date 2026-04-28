import cors from "cors";
import express from "express";
import { errorHandler } from "../middleware/errorHandler";
import { notFoundHandler } from "../middleware/notFoundHandler";
import { requestLogger } from "../middleware/requestLogger";
import { apiRouter } from "../routes";
import { sendSuccess } from "../utils/apiResponse";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  sendSuccess(res, { status: "ok" });
});

app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
