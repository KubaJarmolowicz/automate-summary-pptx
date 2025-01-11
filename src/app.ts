import dotenv from "dotenv";
dotenv.config();

import express from "express";
import rateLimit from "express-rate-limit";
import { LogService } from "./services/LogService";
import path from "path";
import routes from "./routes";
import { protectForm } from "./middleware/authMiddleware";
import session from "express-session";
import { createClient } from "redis";
import ConnectRedis from "connect-redis";

const RedisStore = ConnectRedis(session);

const app = express();
const logger = new LogService();

// Trust proxy (needed for Render.com)
app.set("trust proxy", 1);

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
    rolling: true,
    name: "sessionId",
  })
);

app.use((req, res, next) => protectForm(req, res, next));
app.use(express.static(path.join(__dirname, "public")));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
});

app.use(limiter);

// Routes
app.use(routes);

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err) {
      logger.logError("Express", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      next();
    }
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
