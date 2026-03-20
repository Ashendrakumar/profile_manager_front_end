import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL } from "node:url";

const PORT = Number(process.env.PORT || 10000);
const distDir = path.resolve(process.cwd(), "dist");
const indexFile = path.join(distDir, "index.html");

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".ico":
      return "image/x-icon";
    case ".woff":
      return "font/woff";
    case ".woff2":
      return "font/woff2";
    default:
      return "application/octet-stream";
  }
}

function safeJoin(root, requestPath) {
  // Prevent directory traversal by resolving against the dist directory.
  const normalized = path
    .normalize(requestPath)
    .replace(/^(\.\.(\/|\\|$))+/, "");
  const full = path.join(root, normalized);
  if (!full.startsWith(root)) return null;
  return full;
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end("Bad Request");
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
    return;
  }

  const requestUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(requestUrl.pathname);

  // Serve existing static files; otherwise, SPA fallback to index.html for client routes.
  const filePath = safeJoin(
    distDir,
    pathname.startsWith("/") ? pathname.slice(1) : pathname
  );
  const hasExtension = path.extname(pathname) !== "";

  if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { "Content-Type": contentTypeFor(filePath) });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  if (hasExtension) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
    return;
  }

  if (!fs.existsSync(indexFile)) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("dist/index.html not found. Did you run `npm run build`?");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  fs.createReadStream(indexFile).pipe(res);
});

server.listen(PORT, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`SPA server listening on port ${PORT}`);
});
