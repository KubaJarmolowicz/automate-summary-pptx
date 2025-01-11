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

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Session configuration
let sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: true,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "strict",
  },
  rolling: true,
  name: "sessionId",
};

// Only use Redis in production and when REDIS_URL is available
if (process.env.NODE_ENV === "production" && process.env.REDIS_URL) {
  const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
    },
  });

  redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
  });

  redisClient.connect().catch((err) => {
    console.error("Redis Connection Error:", err);
    // Fall back to memory store if Redis fails
    console.log("Falling back to memory store");
  });

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "session:",
  });

  sessionConfig.store = redisStore;
}

app.use(session(sessionConfig));

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
