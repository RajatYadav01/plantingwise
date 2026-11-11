import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import { errorHandler } from "./middleware/error-handler.middleware.ts";
import { corsMiddleware, originGuard } from "./middleware/origin.middleware.ts";
import apiRoutes from "./routes/index.ts";

const app: Express = express();

app.disable("x-powered-by");
app.use(originGuard);
app.use(corsMiddleware);
app.use(express.json({ limit: "6mb" }));
app.use(cookieParser());
app.use("/api/v1", apiRoutes);
app.use(errorHandler);

export default app;
