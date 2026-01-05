const axios = require("axios");
const fs = require("fs");

const convoFile = "convo.json";
const apiUrl = "https://www.pinoygpt.com/api/chat_response.php";

// Ensure convo file exists at module load
if (!fs.existsSync(convoFile)) {
  fs.writeFileSync(convoFile, JSON.stringify({}), "utf-8");
}

function loadConversation(uid) {
  const convos = JSON.parse(fs.readFileSync(convoFile, "utf-8"));
  return convos[uid] || [];
}

function saveConversation(uid, messages) {
  const convos = JSON.parse(fs.readFileSync(convoFile, "utf-8"));
  convos[uid] = messages;
  fs.writeFileSync(convoFile, JSON.stringify(convos, null, 2), "utf-8");
}

function clearConversation(uid) {
  const convos = JSON.parse(fs.readFileSync(convoFile, "utf-8"));
  delete convos[uid];
  fs.writeFileSync(convoFile, JSON.stringify(convos, null, 2), "utf-8");
}

module.exports = {
  meta: {
    name: "GPT-4 (Conversational)",
    description: "Maintains a simple conversational history per UID and forwards concatenated messages to an external GPT-like API.",
    category: "ai",
    method: "GET",
    endpoint: "/gpt4-convo",
    params: [
      {
        name: "prompt",
        type: "string",
        required: true,
        placeholder: "hello"
      },
      {
        name: "uid",
        type: "string",
        required: true,
        placeholder: "123"
      }
    ],
    response: {
      type: "json",
      example: {
        status: true,
        response: "Hello! How can I help you today?"
      }
    }
  },

  onStart: async ({ req, res }) => {
    try {
      const { prompt, uid } = req.query;

      if (!prompt || !uid) {
        return res.status(400).json({
          status: false,
          error: "Both prompt and uid parameters are required",
          example: "/gpt4-convo?prompt=hello&uid=123"
        });
      }

      // Handle "clear" command
      if (prompt.toLowerCase() === "clear") {
        clearConversation(uid);
        return res.json({
          status: true,
          message: "Conversation history cleared."
        });
      }

      // Load previous conversation
      let conversation = loadConversation(uid);

      // Add new user message
      conversation.push({ role: "user", content: prompt });

      // Combine messages as plain text context (no assistant labels)
      const messageText = conversation.map((m) => m.content).join("\n");

      // Send to GPT-like API
      const response = await axios.post(
        apiUrl,
        new URLSearchParams({ message: messageText }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
          }
        }
      );

      const text = response.data?.response || "No response received.";

      // Save assistant reply (for internal memory only)
      conversation.push({ role: "assistant", content: text });
      saveConversation(uid, conversation);

      // Send only clean text response
      res.json({
        status: true,
        response: text
      });
    } catch (err) {
      console.error("GPT-4 Conversational Error:", err?.message || err);
      res.status(500).json({
        status: false,
        message: "Failed to get response from GPT-4 conversational API"
      });
    }
  }
};