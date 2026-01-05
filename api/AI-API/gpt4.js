const axios = require("axios");
const fs = require("fs");

const convoFile = "convo.json";
const apiUrl = "https://www.pinoygpt.com/api/chat_response.php";

// Ensure convo file exists
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
    name: "GPT-4 Conversational",
    description: "Conversational AI with persistent memory per user",
    category: "AI",
    method: "GET",
    endpoint: "/api/ai/gpt4-convo",
    params: [
      {
        name: "prompt",
        type: "string",
        required: true,
        placeholder: "Hello"
      },
      {
        name: "uid",
        type: "string",
        required: true,
        placeholder: "user123"
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
    const { prompt, uid } = req.query;

    if (!prompt || !uid) {
      return res.status(400).json({
        status: false,
        message: "prompt and uid are required",
        example: "/api/ai/gpt4-convo?prompt=hello&uid=123"
      });
    }

    try {
      // Clear memory command
      if (prompt.toLowerCase() === "clear") {
        clearConversation(uid);
        return res.json({
          status: true,
          message: "Conversation history cleared"
        });
      }

      // Load memory
      let conversation = loadConversation(uid);

      // Add user message
      conversation.push({ role: "user", content: prompt });

      // Convert convo to plain text
      const messageText = conversation.map(m => m.content).join("\n");

      // Send to GPT API
      const apiResponse = await axios.post(
        apiUrl,
        new URLSearchParams({ message: messageText }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0"
          }
        }
      );

      const text = apiResponse.data?.response || "No response received.";

      // Save assistant reply
      conversation.push({ role: "assistant", content: text });
      saveConversation(uid, conversation);

      res.status(200).json({
        status: true,
        author: "Ry",
        response: text
      });

    } catch (error) {
      console.error("GPT-4 Error:", error.message);
      res.status(500).json({
        status: false,
        message: "Failed to get response from GPT-4 API"
      });
    }
  }
};