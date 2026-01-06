const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const API_DIR = path.join(__dirname, "api");
const categories = {};

function loadApis(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      loadApis(full);
      continue;
    }

    if (!file.endsWith(".js")) continue;

    delete require.cache[require.resolve(full)];
    const api = require(full);
    const meta = api.meta;

    if (!meta || !meta.endpoint || !meta.method) continue;

    const method = meta.method.toLowerCase();

    app[method](meta.endpoint, async (req, res, next) => {
      try {
        // basic validation
        (meta.params || []).forEach(p => {
          if (p.required && !req.query[p.name]) {
            throw {
              status: 400,
              message: `${p.name} is required`
            };
          }
        });

        await api.onStart(req, res, next);
      } catch (e) {
        res
          .status(e.status || 500)
          .json({ error: e.message || "Server error" });
      }
    });

    const cat = meta.category || "Uncategorized";
    categories[cat] ||= [];
    categories[cat].push(meta);
  }
}

loadApis(API_DIR);

app.get("/api", (req, res) => {
  res.json({
    categories: Object.keys(categories).map(c => ({
      name: c,
      count: categories[c].length,
      apis: categories[c]
    }))
  });
});

app.listen(PORT, () =>
  console.log(`🚀 http://localhost:${PORT}`)
);