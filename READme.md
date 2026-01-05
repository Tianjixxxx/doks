# 🚀 Modular REST API Server (Node.js)

A simple **file-based REST API system** where each endpoint is a standalone module.

✔ Easy to extend  
✔ Clean structure  
✔ Perfect for API libraries & dashboards  
✔ Ready for Render / VPS / Local hosting  

---

## 📁 Project Structure

```
.
├── index.js
├── package.json
├── api/
│   ├── <category>/
│   │   └── <name>.js
└── README.md
```

Example:
```
api/random/cat.js
api/tools/removebg.js
```

---

## ⚙ Requirements

- Node.js **v16+**
- npm

---

## 📦 Install Dependencies

```bash
npm install
```

---

## ▶ Run Server

```bash
node index.js
```

or

```bash
npm start
```

---

## 🌐 Base URL

```
http://localhost:3000
```

---

## ➕ Adding a New API Endpoint

### 📂 File Path Format

```
api/<category>/<name>.js
```

Example:
```
api/random/cat.js
```

---

## 🧩 API MODULE TEMPLATE (REQUIRED FORMAT)

```js
// api/<category>/<name>.js

const axios = require("axios"); // optional

module.exports = {
  meta: {
    name: "API Display Name",
    description: "Short description of what this API does",
    category: "Category Name",
    method: "GET",            // GET | POST
    endpoint: "/api/category/name",
    params: [
      {
        name: "param1",
        type: "string",
        required: false,
        placeholder: "example value"
      }
    ],
    response: {
      type: "json",
      example: {
        status: true,
        result: "example"
      }
    }
  },

  onStart: async ({ req, res }) => {
    try {
      res.json({
        status: true,
        message: "API working"
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message
      });
    }
  }
};
```

---

## 🧪 Example API: Random Cat

**File:** `api/random/cat.js`

```js
const axios = require("axios");

module.exports = {
  meta: {
    name: "Random Cat",
    description: "Returns a random cat image",
    category: "Random",
    method: "GET",
    endpoint: "/api/random/cat",
    params: [],
    response: {
      type: "json",
      example: {
        status: true,
        image: "https://cdn2.thecatapi.com/images/abc.jpg"
      }
    }
  },

  onStart: async ({ req, res }) => {
    try {
      const r = await axios.get("https://api.thecatapi.com/v1/images/search");
      res.json({
        status: true,
        image: r.data[0].url
      });
    } catch (e) {
      res.status(500).json({
        status: false,
        message: "Failed to fetch image"
      });
    }
  }
};
```

---

## 📤 Sample JSON Response

```json
{
  "status": true,
  "image": "https://cdn2.thecatapi.com/images/abc.jpg"
}
```

---

## ☁ Hosting on Render

1. Push project to GitHub
2. Go to **Render**
3. Create **New Web Service**
4. Select repository
5. Build Command:
   ```bash
   npm install
   ```
6. Start Command:
   ```bash
   node index.js
   ```
7. Done 🎉

---

## 👤 Author

**Ry**

---

## 📜 License

MIT License