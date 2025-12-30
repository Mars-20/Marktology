import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import passport from "./auth";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { config, getAllowedOrigins } from "./config";
import { apiLimiter } from "./middleware";
import { sanitizeInput } from "./sanitization";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// ============================================
// Security Middleware
// ============================================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: config.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging (skip in test environment)
if (config.NODE_ENV !== 'test') {
  app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev', {
    skip: (req) => req.url.startsWith('/assets') || req.url.startsWith('/public'),
  }));
}

// Rate limiting for API routes
app.use('/api', apiLimiter);

// ============================================
// Session Configuration
// ============================================

const PgSession = connectPgSimple(session);

if (config.DATABASE_URL) {
  app.use(
    session({
      store: new PgSession({
        conString: config.DATABASE_URL,
        tableName: 'sessions',
        createTableIfMissing: true,
      }),
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
      },
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
}

// ============================================
// Body Parsing
// ============================================

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
    limit: '10mb',
  }),
);

app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// ============================================
// Input Sanitization
// ============================================

// Sanitize all input to prevent XSS attacks
app.use('/api', sanitizeInput);

// ============================================
// Logging Utility
// ============================================

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Custom request logger
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse && res.statusCode >= 400) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// ============================================
// Application Startup
// ============================================

(async () => {
  await registerRoutes(httpServer, app);

  // Start follow-up scheduler
  if (config.DATABASE_URL) {
    const { startFollowUpScheduler } = await import('./cron/followUpScheduler');
    startFollowUpScheduler();
  }

  // Global error handler (must be after routes)
  const { errorHandler } = await import('./errorHandler');
  app.use(errorHandler);

  // Setup Vite in development or serve static files in production
  if (config.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Start server
  const port = config.PORT;
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`🚀 Server running on port ${port}`);
      log(`📍 Environment: ${config.NODE_ENV}`);
      log(`🌐 App URL: ${config.APP_URL}`);
    },
  );
})();
