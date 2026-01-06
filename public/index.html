<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Autumn API Dashboard</title>
<style>
:root{
  --bg1:#2b160a;
  --bg2:#4a2412;
  --card:#5a2d15;
  --soft:#6b3a1e;
  --accent:#f97316;
  --accent-2:#fb923c;
  --text:#fff7ed;
  --muted:#fdba74;
  --border:#92400e;
}
*{box-sizing:border-box;}
body{margin:0;font-family:system-ui,-apple-system,Segoe UI;background:radial-gradient(circle at top,var(--bg2),var(--bg1));color:var(--text);overflow-x:hidden;}
header{position:fixed;inset:0 0 auto 0;height:58px;background:rgba(43,22,10,.9);backdrop-filter:blur(10px);display:flex;align-items:center;padding:0 20px;font-weight:900;letter-spacing:.5px;border-bottom:1px solid var(--border);z-index:20;}
#banner{display:block;margin:70px auto 24px;width:90%;max-width:900px;height:200px;border-radius:16px;overflow:hidden;border:1px solid var(--border);}
#banner img{width:100%;height:100%;object-fit:cover;border-radius:16px;}
main{padding:16px;max-width:900px;margin:auto;}
.container{margin-bottom:30px;}
.container h2{text-align:center;margin-bottom:14px;font-weight:900;}
.section{background:linear-gradient(180deg,#6b3a1e,#4a2412);border-radius:18px;margin-bottom:18px;border:1px solid var(--border);box-shadow:0 10px 30px rgba(0,0,0,.35);overflow:hidden;}
.section-header{padding:18px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;}
.section-title{font-weight:900;text-transform:lowercase;}
.section-meta{font-size:.8rem;color:var(--muted);}
.section-body{display:none;padding:14px;}
.api{background:linear-gradient(180deg,#5a2d15,#3f1e0d);border-radius:14px;padding:16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border:1px solid var(--border);box-shadow:inset 0 1px 0 rgba(255,255,255,.08);}
.api-name{font-weight:900;}
.api-category{font-size:.75rem;color:var(--muted);}
.api-endpoint{font-family:monospace;font-size:.8rem;background:rgba(0,0,0,.3);padding:6px 10px;border-radius:999px;margin-top:6px;}
.btn{background:linear-gradient(135deg,var(--accent),var(--accent-2));border:none;color:#431407;padding:10px 16px;border-radius:12px;font-weight:900;cursor:pointer;box-shadow:0 8px 20px rgba(249,115,22,.4);}
.btn:hover{transform:translateY(-1px);filter:brightness(1.05);}
.secondary{background:rgba(255,255,255,.08);color:var(--text);box-shadow:none;}
.modal{position:fixed;inset:0;background:rgba(0,0,0,.7);display:none;align-items:center;justify-content:center;padding:16px;z-index:30;}
.modal-box{width:100%;max-width:720px;background:linear-gradient(180deg,#6b3a1e,#3f1e0d);border-radius:20px;padding:22px;border:1px solid var(--border);box-shadow:0 30px 80px rgba(0,0,0,.6);}
.url-box{background:rgba(0,0,0,.4);padding:12px;border-radius:12px;font-family:monospace;font-size:.8rem;word-break:break-all;}
.response{background:rgba(0,0,0,.45);border-radius:14px;padding:14px;height:240px;overflow:auto;font-family:monospace;font-size:.85rem;white-space:pre;border:1px solid var(--border);}
.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;}
.loading-dashboard{display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;color:var(--muted);}
.spinner{border:6px solid rgba(255,255,255,0.1);border-top:6px solid var(--accent);border-radius:50%;width:50px;height:50px;animation:spin 1s linear infinite;margin-bottom:12px;}
@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
.leaf{position:fixed;top:-10%;font-size:24px;pointer-events:none;animation:fall linear infinite;z-index:5;opacity:.9;}
@keyframes fall{0%{transform:translateY(-10vh) rotate(0deg)}100%{transform:translateY(110vh) rotate(360deg)}}
</style>
</head>
<body>
<header>🍁 Autumn API Dashboard</header>

<main>
  <div id="banner"><img src="https://i.imgur.com/f9UHHgk.gif" alt="Seasonal Banner" /></div>

  <!-- Loading -->
  <div id="loading" class="loading-dashboard">
    <div class="spinner"></div>
    <div>Loading Dashboard...</div>
  </div>

  <!-- API List -->
  <div id="apiContainer" class="container" style="display:none;">
    <h2>API List</h2>
    <div id="app"></div>
  </div>

  <!-- Popular APIs (just list, no count) -->
  <div id="popularContainer" class="container">
    <h2>Popular APIs 🔥</h2>
    <div id="popular"></div>
  </div>
</main>

<div id="modal" class="modal">
  <div class="modal-box">
    <h3 id="mTitle"></h3>
    <div class="url-box" id="mUrl"></div>
    <div class="response" id="mRes">Response will appear here...</div>
    <div class="actions">
      <button class="btn" onclick="exec()">Execute</button>
      <button class="btn secondary" onclick="copyUrl()">Copy URL</button>
      <button class="btn secondary" onclick="copyResponse()">Copy Response</button>
      <button class="btn secondary" onclick="closeModal()">Close</button>
    </div>
  </div>
</div>

<script>
let apiData=null,current=null;

async function load(){
  const r = await fetch("/api");
  apiData = await r.json();

  document.getElementById("loading").style.display = "none";
  document.getElementById("apiContainer").style.display = "block";

  render();
  renderPopular();
}

function render(){
  const app=document.getElementById("app");
  app.innerHTML="";
  apiData.categories.forEach(cat=>{
    const box=document.createElement("div");
    box.className="section";
    box.innerHTML=`
      <div class="section-header">
        <div class="section-title">${cat.name.toLowerCase()}</div>
        <div class="section-meta">${cat.count} APIs</div>
      </div>
      <div class="section-body"></div>
    `;
    const body=box.querySelector(".section-body");
    cat.apis.forEach(api=>{
      const el=document.createElement("div");
      el.className="api";
      el.innerHTML=`
        <div>
          <div class="api-name">${api.name}</div>
          <div class="api-category">category: ${api.category}</div>
          <div class="api-endpoint">${api.endpoint}</div>
        </div>
        <button class="btn">Test</button>
      `;
      el.querySelector("button").onclick=()=>open(api);
      body.appendChild(el);
    });
    box.querySelector(".section-header").onclick=()=>{body.style.display = body.style.display==="block"?"none":"block";}
    app.appendChild(box);
  });
}

function renderPopular(){
  const popular=document.getElementById("popular");
  popular.innerHTML="";
  const popularApis = apiData.categories.flatMap(c=>c.apis);
  popularApis.forEach(api=>{
    const el=document.createElement("div");
    el.className="api";
    el.innerHTML=`
      <div>
        <div class="api-name">${api.name}</div>
        <div class="api-category">category: ${api.category}</div>
        <div class="api-endpoint">${api.endpoint}</div>
      </div>
      <button class="btn">Test</button>
    `;
    el.querySelector("button").onclick=()=>open(api);
    popular.appendChild(el);
  });
}

function open(api){
  current=api;
  document.getElementById("modal").style.display="flex";
  document.getElementById("mTitle").textContent=api.name;
  document.getElementById("mUrl").textContent=location.origin+api.endpoint;
  document.getElementById("mRes").textContent="Response will appear here...";
}

async function exec(){
  const resBox = document.getElementById("mRes");
  resBox.textContent = "Loading...";
  try {
    const r = await fetch(`/call-api?endpoint=${encodeURIComponent(current.endpoint)}`);
    const text = await r.text();
    try {
      const json = JSON.parse(text);
      resBox.textContent = JSON.stringify(json, null, 2);
    } catch {
      resBox.textContent = text;
    }
  } catch(e){
    resBox.textContent = "Error fetching API";
  }
}

function copyUrl(){navigator.clipboard.writeText(document.getElementById("mUrl").textContent);}
function copyResponse(){navigator.clipboard.writeText(document.getElementById("mRes").textContent);}
function closeModal(){document.getElementById("modal").style.display="none";}

/* FALLING LEAVES */
const leaves = ["🍁","🍂","🍃"];
setInterval(()=>{
  const leaf=document.createElement("div");
  leaf.className="leaf";
  leaf.textContent=leaves[Math.floor(Math.random()*leaves.length)];
  leaf.style.left=Math.random()*100+"vw";
  leaf.style.animationDuration=8+Math.random()*6+"s";
  leaf.style.fontSize=16+Math.random()*20+"px";
  document.body.appendChild(leaf);
  setTimeout(()=>leaf.remove(),15000);
},600);

load();
</script>
</body>
</html>