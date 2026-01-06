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

      const category =
        meta.category ||
        folder.toLowerCase() ||
        "uncategorized";

      const endpoint =
        meta.endpoint ||
        `/${category}/${fileName}`;

      const method = (meta.method || "GET").toLowerCase();

      app[method](endpoint, api.onStart);

      const catKey = category.toUpperCase();
      categories[catKey] ??= [];
      categories[catKey].push({
        name: meta.name || fileName,
        description: meta.description || "",
        endpoint,
        method: method.toUpperCase(),
        category
      });
    }
  }
}

loadApis();

/* 📦 DASHBOARD API */
app.get("/api", (req, res) => {
  res.json({
    status: true,
    categories: Object.keys(categories).map(cat => ({
      name: cat,
      count: categories[cat].length,
      apis: categories[cat]
    }))
  });
});

/* ❌ 404 */
app.use((req, res) => {
  res.status(404).json({ status: false, message: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});