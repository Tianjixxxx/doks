const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const API_DIR = path.join(__dirname, "api");
const categories = {};

/* LOAD APIs */
function loadApis(dir){
  for(const file of fs.readdirSync(dir)){
    const full = path.join(dir,file);

    if(fs.statSync(full).isDirectory()){
      loadApis(full);
      continue;
    }

    if(!file.endsWith(".js")) continue;

    const api = require(full);
    if(!api.meta || !api.onStart) continue;

    const { meta } = api;
    const method = meta.method.toLowerCase();

    app[method](meta.endpoint, api.onStart);

    const cat = meta.category || "Uncategorized";
    categories[cat] ??= [];
    categories[cat].push(meta);
  }
}

loadApis(API_DIR);

/* DASHBOARD DATA */
app.get("/api",(req,res)=>{
  res.json({
    status:true,
    categories:Object.keys(categories).map(c=>({
      name:c,
      count:categories[c].length,
      apis:categories[c]
    }))
  });
});

/* 404 */
app.use((req,res)=>{
  res.status(404).json({status:false,message:"Not Found"});
});

/* 500 */
app.use((err,req,res,next)=>{
  console.error(err);
  res.status(500).json({status:false,message:"Server Error"});
});

app.listen(PORT,()=>{
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});