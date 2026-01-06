const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// Path to your API folder
const API_DIR = path.join(__dirname, "api");
const categories = {};

/* 🔁 LOAD APIs */
function loadApis() {
  // Loop through each subfolder in /api
  for (const folder of fs.readdirSync(API_DIR)) {
    const folderPath = path.join(API_DIR, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    for (const file of fs.readdirSync(folderPath)) {
      if (!file.endsWith(".js")) continue;

      const apiPath = path.join(folderPath, file);
      const api = require(apiPath);

      if (!api.meta || !api.onStart) continue; // skip if invalid

      const {
        name,
        version,
        author,
        description,
        category = folder.toLowerCase(),
        method = "GET",
        path: endpoint
      } = api.meta;

      // Register endpoint dynamically
      const httpMethod = method.toLowerCase();
      app[httpMethod](endpoint, async (req, res, next) => {
        try {
          await api.onStart(req, res, next);
        } catch (err) {
          next(err);
        }
      });

      // Add to categories for dashboard
      const catKey = category.toUpperCase();
      categories[catKey] ??= [];
      categories[catKey].push({
        name,
        version,
        author,
        description,
        category,
        method: method.toUpperCase(),
        endpoint
      });
    }
  }
}

loadApis();

/* 📦 DASHBOARD API */
app.get("/api", (req, res) => {
  const responseCategories = Object.keys(categories).map(cat => ({
    name: cat,
    count: categories[cat].length,
    apis: categories[cat]
  }));
  res.json({ status: true, categories: responseCategories });
});

/* 🔁 CALL-API: proxy call to endpoint */
app.get("/call-api", async (req, res) => {
  const { endpoint } = req.query;
  if (!endpoint) return res.status(400).send("endpoint required");

  let found = null;
  for (const cat of Object.values(categories)) {
    for (const a of cat) {
      if (a.endpoint === endpoint) found = a;
    }
  }
  if (!found) return res.status(404).send("API not found");

  try {
    // Dynamically require the API handler
    const folderPath = path.join(API_DIR, found.category.toLowerCase());
    const apiFile = fs.readdirSync(folderPath)
      .filter(f => f.endsWith(".js"))
      .map(f => path.join(folderPath, f))
      .find(f => require(f).meta.path === endpoint);

    if (!apiFile) return res.status(404).send("API file not found");

    const apiModule = require(apiFile);
    await apiModule.onStart(req, res);

  } catch (err) {
    console.error(err);
    res.status(500).send("API execution error");
  }
});

/* ❌ 404 fallback */
app.use((req, res) => res.status(404).send("Not Found"));

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));