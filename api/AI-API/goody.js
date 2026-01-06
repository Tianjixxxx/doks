const axios = require("axios");

exports.meta = {
  name: "GoodyAI",
  version: "1.0.0",
  author: "Ry",
  description: "Generate responses using GoodyAI",
  category: "Ai",
  method: "GET",
  path: "/goody?q="
};

const font = {
  bold: (text) => {
    const boldMap = {
      'a': '𝗮','b': '𝗯','c': '𝗰','d': '𝗱','e': '𝗲','f': '𝗳','g': '𝗴','h': '𝗵','i': '𝗶','j': '𝗷',
      'k': '𝗸','l': '𝗹','m': '𝗺','n': '𝗻','o': '𝗼','p': '𝗽','q': '𝗾','r': '𝗿','s': '𝘀','t': '𝘁',
      'u': '𝘂','v': '𝘃','w': '𝘄','x': '𝘅','y': '𝘆','z': '𝘇',
      'A': '𝗔','B': '𝗕','C': '𝗖','D': '𝗗','E': '𝗘','F': '𝗙','G': '𝗚','H': '𝗛','I': '𝗜','J': '𝗝',
      'K': '𝗞','L': '𝗟','M': '𝗠','N': '𝗡','O': '𝗢','P': '𝗣','Q': '𝗤','R': '𝗥','S': '𝗦','T': '𝗧',
      'U': '𝗨','V': '𝗩','W': '𝗪','X': '𝗫','Y': '𝗬','Z': '𝗭',
      '0': '𝟬','1': '𝟭','2': '𝟮','3': '𝟯','4': '𝟰','5': '𝟱','6': '𝟲','7': '𝟳','8': '𝟴','9': '𝟵'
    };
    return text.split('').map(char => boldMap[char] || char).join('');
  }
};

function parseSSEResponse(sseData) {
  let fullMessage = "";
  const lines = sseData.split('\n\n');

  for (const line of lines) {
    if (line.startsWith('event: message')) {
      const dataMatch = line.match(/data: (.*)/);
      if (dataMatch && dataMatch[1]) {
        try {
          const jsonData = JSON.parse(dataMatch[1]);
          if (jsonData.content !== undefined) {
            fullMessage += jsonData.content;
          }
        } catch (e) {
          continue;
        }
      }
    }
  }
  return fullMessage;
}

exports.onStart = async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ status: false, message: "No prompt provided" });
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
    'Content-Type': 'text/plain',
    'Accept': '*/*',
    'Origin': 'https://www.goody2.ai',
    'Referer': 'https://www.goody2.ai/chat'
  };

  try {
    const response = await axios.post(
      "https://www.goody2.ai/send",
      JSON.stringify({ message: query, debugParams: null }),
      { headers, responseType: 'text' }
    );

    const fullText = parseSSEResponse(response.data);
    const formattedText = fullText.replace(/\*\*(.*?)\*\*/g, (_, text) => font.bold(text));

    res.json({
      status: true,
      response: formattedText,
      author: exports.meta.author
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Service unavailable",
      details: error.message
    });
  }
};