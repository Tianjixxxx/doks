const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

/* =====================
   MIDDLEWARE
===================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================
   STATIC FRONTEND
===================== */
app.use(express.static(path.join(__dirname, "public")));

/* =====================
   API AUTO LOADER
===================== */
const APIS = [];
const apiDir = path.join(__dirname, "api");

function loadApis(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      loadApis(fullPath);
    } else if (file.endsWith(".js")) {
      try {
        const mod = require(fullPath);
        if (!mod.meta || !mod.handler) continue;

        APIS.push(mod.meta);

        const method = (mod.meta.method || "GET").toLowerCase();
        const endpoint = mod.meta.endpoint;

        if (!app[method]) {
          console.warn(`Invalid method ${method} in ${file}`);
          continue;
        }

        app[method](endpoint, async (req, res, next) => {
          try {
            await mod.handler({ req, res });
          } catch (err) {
            next(err);
          }
        });

        console.log(`Loaded API: ${method.toUpperCase()} ${endpoint}`);
      } catch (err) {
        console.error("Failed loading:", fullPath);
        console.error(err);
      }
    }
  }
}

loadApis(apiDir);

/* =====================
   API LIST (FRONTEND USE)
===================== */
app.get("/api", (req, res) => {
  res.json(APIS);
});

/* =====================
   404 HANDLER
===================== */
app.use((req, res) => {
  res.status(404).sendFile(
    path.join(__dirname, "public", "404.html")
  );
});

/* =====================
   500 HANDLER
===================== */
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).sendFile(
    path.join(__dirname, "public", "500.html")
  );
});

/* =====================
   START SERVER
===================== */
app.listen(PORT, () => {
  console.log(`🚀 API Library running on http://localhost:${PORT}`);
});