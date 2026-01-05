const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const API_DIR = path.join(__dirname, "api");

const apiList = [];
const categories = {};

/* 🔁 LOAD ALL API FILES */
function loadApis(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      loadApis(full);
      continue;
    }

    if (!file.endsWith(".js")) continue;

    const api = require(full);
    if (!api.meta || !api.onStart) continue;

    const meta = api.meta;
    const method = meta.method.toLowerCase();

    // register route
    app[method](meta.endpoint, api.onStart);

    // save api list
    apiList.push(meta);

    // group by category
    const cat = meta.category || "Uncategorized";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(meta);
  }
}

loadApis(API_DIR);

/* 📦 API LIST FOR DASHBOARD */
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
  res.status(404).sendFile(path.join(__dirname, "public/404.html"));
});

/* 💥 500 */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).sendFile(path.join(__dirname, "public/500.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});