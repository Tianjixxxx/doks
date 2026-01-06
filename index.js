const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

/* 🔐 GLOBAL RESPONSE WRAPPER */
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (data) => {
    // If response is already an object, inject Author
    if (typeof data === "object" && data !== null) {
      data = {
        Author: "Ry",
        ...data
      };
    }
    return originalJson(data);
  };

  next();
});

const API_DIR = path.join(__dirname, "api");
const categories = {};

/* 🔁 LOAD APIs (CATEGORY FROM FOLDER) */
function loadApis(dir, parentCategory = null) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      loadApis(full, file.toUpperCase());
      continue;
    }

    if (!file.endsWith(".js")) continue;

    const api = require(full);
    if (!api.meta || !api.onStart) continue;

    const meta = api.meta;
    const method = meta.method.toLowerCase();
    const category = meta.category || parentCategory || "UNCATEGORIZED";

    app[method](meta.endpoint, api.onStart);

    if (!categories[category]) categories[category] = [];
    categories[category].push({ ...meta, category });
  }
}

loadApis(API_DIR);

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
  res.status(404).json({
    status: false,
    message: "Not Found"
  });
});

/* 💥 500 */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    status: false,
    message: "Server Error"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});