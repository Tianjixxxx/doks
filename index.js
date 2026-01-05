const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   API REGISTRY
================================ */
const apiList = {};
const apiRoot = path.join(__dirname, "api");

/* ===============================
   AUTO LOAD APIS
================================ */
function loadApis(dir, category = null) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      loadApis(full, file);
    } else if (file.endsWith(".js")) {
      const api = require(full);

      if (!api.meta || !api.onStart) return;

      const cat = api.meta.category || category || "Uncategorized";
      if (!apiList[cat]) apiList[cat] = [];

      // Register route
      app[api.meta.method.toLowerCase()](
        api.meta.endpoint,
        async (req, res) => {
          try {
            const originalJson = res.json.bind(res);
            res.json = data => {
              if (typeof data === "object" && !data.author) {
                data.author = "Ry";
              }
              return originalJson(data);
            };
            await api.onStart({ req, res });
          } catch (err) {
            res.status(500).json({
              status: false,
              message: "Internal Server Error",
              author: "Ry"
            });
          }
        }
      );

      apiList[cat].push({
        name: api.meta.name,
        description: api.meta.description,
        endpoint: api.meta.endpoint,
        method: api.meta.method
      });

      console.log(`✔ Loaded API: ${api.meta.endpoint}`);
    }
  });
}

loadApis(apiRoot);

/* ===============================
   API LIST FOR DASHBOARD
================================ */
app.get("/api/list", (req, res) => {
  res.json(apiList);
});

/* ===============================
   STATIC FRONTEND
================================ */
app.use(express.static(path.join(__dirname, "public")));

/* ===============================
   404 HANDLER
================================ */
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "errors/404.html"));
});

/* ===============================
   500 HANDLER
================================ */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).sendFile(path.join(__dirname, "errors/500.html"));
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});