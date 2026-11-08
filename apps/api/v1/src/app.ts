import cookieParser from "cookie-parser";
import express from "express";
import { errorHandler } from "./middleware/error-handler.middleware";
import { corsMiddleware, originGuard } from "./middleware/origin.middleware";
import apiRoutes from "./routes";

const app = express();

app.disable("x-powered-by");
app.use(originGuard);
app.use(corsMiddleware);
app.use(express.json({ limit: "6mb" }));
app.use(cookieParser());
app.use("/api/v1", apiRoutes);
app.use(errorHandler);

export default app;
