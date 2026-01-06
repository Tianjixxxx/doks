const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const API_DIR = path.join(__dirname, "api");
const categories = {};

/* 🔁 LOAD APIs */
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
      const category = meta.category?.toLowerCase() || folder.toLowerCase() || "uncategorized";
      const endpoint = meta.endpoint || `/${category}/${fileName}`;
      const method = (meta.method || "GET").toLowerCase();

      const apiObj = {
        name: meta.name || fileName,
        description: meta.description || "",
        endpoint,
        method: method.toUpperCase(),
        category,
        params: meta.params || [], // <-- add params metadata
        _apiRef: api
      };

      const catKey = category.toUpperCase();
      categories[catKey] ??= [];
      categories[catKey].push(apiObj);

      // Attach route
      app[method](endpoint, async (req, res, next) => {
        try {
          await api.onStart(req, res, next);
        } catch (err) {
          next(err);
        }
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
    apis: categories[cat].map(a => ({
      name: a.name,
      description: a.description,
      endpoint: a.endpoint,
      method: a.method,
      category: a.category,
      params: a.params   // <-- send params to frontend
    }))
  }));
  res.json({ status: true, categories: responseCategories });
});

/* 🔁 CALL-API: execute API and return raw response */
app.get("/call-api", async (req, res) => {
  const { endpoint, ...queryParams } = req.query; // <-- capture all query parameters
  if (!endpoint) return res.status(400).send("endpoint required");

  let found = null;
  for (const cat of Object.values(categories)) {
    for (const a of cat) {
      if (a.endpoint === endpoint) found = a;
    }
  }
  if (!found) return res.status(404).send("API not found");

  let sent = false;
  const resProxy = {
    json: (data) => { if (!sent) { sent = true; res.json(data); } },
    send: (data) => { if (!sent) { sent = true; res.send(data); } }
  };

  try {
    // Inject query params into req.query for the API
    req.query = { ...req.query, ...queryParams };
    await found._apiRef.onStart(req, resProxy);
  } catch (err) {
    res.status(500).send("API execution error");
  }
});

/* ❌ 404 */
app.use((req, res) => res.status(404).send("Not Found"));

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));