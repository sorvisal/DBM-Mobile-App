const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const PORT = 3001;
const API_TARGET = "https://dbmapi.palsatya.site";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Client-App"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(
  "/api",
  createProxyMiddleware({
    target: API_TARGET,

    changeOrigin: true,

    secure: true,

    logLevel: "debug",

    /*
     * Keep the /api path.
     *
     * Example:
     *
     * http://localhost:3001/api/v1/products
     *
     * becomes:
     *
     * https://dbmapi.palsatya.site/api/v1/products
     */

    onProxyReq: (proxyReq, req) => {
      proxyReq.setHeader(
        "X-Client-App",
        "mobile"
      );

      console.log(
        `[proxy] ${req.method} ${req.originalUrl} -> ${API_TARGET}${req.originalUrl}`
      );
    },

    onProxyRes: (proxyRes, req) => {
      console.log(
        `[proxy] ${req.method} ${req.originalUrl} <- ${proxyRes.statusCode}`
      );
    },

    onError: (err, req, res) => {
      console.error(
        `[proxy] ${req.method} ${req.originalUrl} ERROR:`,
        err.message
      );

      if (!res.headersSent) {
        res.status(502).json({
          message: "API proxy error",
          error: err.message,
        });
      }
    },
  })
);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    proxy: "DBM API Proxy",
    target: API_TARGET,
  });
});

/* =========================================================
   START
========================================================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("========================================");
  console.log(" DBM API Proxy");
  console.log("========================================");
  console.log(`Local:  http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Target: ${API_TARGET}`);
  console.log("========================================");
  console.log("");
});