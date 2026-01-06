const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

/* 🌍 GLOBAL RESPONSE AUTHOR */
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    if (typeof data === "object" && data !== null) {
      data = { Author: "Ry", ...data };
    }
    return originalJson(data);
  };
  next();
});

const API_DIR = path.join(__dirname, "api");
const categories = {};

/* 🔁 LOAD APIs WITH callCount */
function loadApis() {
  for (const folder of fs.readdirSync(API_DIR)) {
    const folderPath = path.join(API_DIR, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    for (const file of fs.readdirSync(folderPath)) {
      if (!file.endsWith(".js")) continue;

      const apiPath = path.join(folderPath, file);
      const api = require(apiPath);

      if (!api.onStart) continue;

      const fileName = path.basename(file, ".js");
      const meta = api.meta || {};

      const category =
        meta.category?.toLowerCase() ||
        folder.toLowerCase() ||
        "uncategorized";

      const endpoint =
        meta.endpoint ||
        `/${category}/${fileName}`;

      const method = (meta.method || "GET").toLowerCase();

      // Initialize callCount
      api.callCount = 0;

      // Wrap original handler to increment callCount
      app[method](endpoint, async (req, res, next) => {
        try {
          api.callCount++; // increment
          await api.onStart(req, res, next);
        } catch (err) {
          next(err);
        }
      });

      const catKey = category.toUpperCase();
      categories[catKey] ??= [];
      categories[catKey].push({
        name: meta.name || fileName,
        description: meta.description || "",
        endpoint,
        method: method.toUpperCase(),
        category,
        callCount: 0, // track callCount here too
        _apiRef: api // store reference to update callCount dynamically
      });
    }
  }
}

loadApis();

/* 📦 DASHBOARD API */
app.get("/api", (req, res) => {
  // Update callCount dynamically before sending
  const responseCategories = Object.keys(categories).map(cat => ({
    name: cat,
    count: categories[cat].length,
    apis: categories[cat].map(a => ({
      name: a.name,
      description: a.description,
      endpoint: a.endpoint,
      method: a.method,
      category: a.category,
      callCount: a._apiRef.callCount
    }))
  }));
  res.json({ status: true, categories: responseCategories });
});

/* 🔑 CALL-API ENDPOINT */
app.get("/call-api", async (req, res) => {
  const { endpoint, key } = req.query;
  if (!key) return res.status(400).json({ error: "API key required" });

  // find the API
  let found = null;
  for (const cat of Object.values(categories)) {
    for (const a of cat) {
      if (a.endpoint === endpoint) found = a;
    }
  }

  if (!found) return res.status(404).json({ error: "API not found" });

  // increment callCount
  found._apiRef.callCount++;

  // simulate API response
  res.json({
    endpoint: found.endpoint,
    timestamp: new Date(),
    callCount: found._apiRef.callCount
  });
});

/* ❌ 404 */
app.use((req, res) => {
  res.status(404).json({ status: false, message: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});