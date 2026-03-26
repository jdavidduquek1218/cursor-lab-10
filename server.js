const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Method not allowed");
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = url.pathname === "/" ? "/index.html" : url.pathname;

    // Normaliza y quita el `/` inicial para que `path.join` no ignore `PUBLIC_DIR`.
    const normalized = path.normalize(pathname).replace(/^([/\\])+/, "");

    const resolvedPublicDir = path.resolve(PUBLIC_DIR);
    const resolvedPath = path.resolve(resolvedPublicDir, normalized);

    // Evita `../` para que el archivo siempre quede dentro de `public/`.
    if (!resolvedPath.startsWith(resolvedPublicDir + path.sep)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }

    const data = await fs.promises.readFile(resolvedPath);
    res.writeHead(200, {
      "Content-Type": contentTypeFor(resolvedPath),
      "Cache-Control": "no-store",
    });
    if (req.method === "HEAD") {
      res.end();
    } else {
      res.end(data);
    }
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : PORT;
  console.log(`Servidor listo: http://localhost:${port}`);
});

