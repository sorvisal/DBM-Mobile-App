const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = 3001;
const apiTarget = "https://dbmapi.palsatya.site";

// Allow CORS for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Client-App");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Proxy all /api requests to the backend
app.use("/api", createProxyMiddleware({
  target: apiTarget,
  changeOrigin: true,
  secure: false,
  logLevel: "debug",
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader("X-Client-App", "mobile");
    console.log(`[proxy] ${req.method} ${req.url} -> ${apiTarget}${req.url}`);
  },
  onProxyRes: (proxyRes, req) => {
    console.log(`[proxy] ${req.url} <- ${proxyRes.statusCode}`);
  },
  onError: (err, req) => {
    console.error(`[proxy] error for ${req.url}:`, err.message);
  },
}));

app.listen(port, () => {
  console.log(`CORS proxy running at http://localhost:${port}`);
  console.log(`API proxy: http://localhost:${port}/api/*`);
});
