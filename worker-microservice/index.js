import cluster from "node:cluster";
import os from "node:os";
import env from "./config/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";

// mongodb, middlewares, routers
import { connectDB } from "./config/db.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import { rateLimiterMiddleware } from "./middlewares/rateLimiter.middleware.js";
import router from "./routes/auth.routes.js";

if (cluster.isPrimary) {
  // prod
  // const numCPUs = os.cpus().length;

  // dev
  const numCPUs = 1;
  for (let i = 0; i < numCPUs; i++) cluster.fork();
  cluster.on("exit", () => cluster.fork());
} else {
  const app = express();

  connectDB();

  app.set("trust proxy", 1);
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(rateLimiterMiddleware);

  app.use(
    session({
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: env.DB_URI,
      }),
      cookie: {
        secure: env.NODE === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
      },
    }),
  );

  // health
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // routes
  app.use("/api", router);
  // global error
  app.use(globalErrorHandler);

  const PORT = env.PORT;
  if (!PORT) {
    throw new Error("PORT is not defined in environment variables");
    process.exit(1);
  }
  app.listen(PORT, () =>
    console.log(`Worker ${process.pid} running on port ${PORT}`),
  );
}
