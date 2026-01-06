const axios = require("axios");

exports.meta = {
  name: "GoodyAI",
  description: "Generate responses using GoodyAI",
  category: "Ai",
  method: "GET"
};

const font = {
  bold(text) {
    const map = {
      a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',
      k:'𝗸',l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',
      t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',
      A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',
      K:'𝗞',L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',
      T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',
      0:'𝟬',1:'𝟭',2:'𝟮',3:'𝟯',4:'𝟰',5:'𝟱',6:'𝟲',7:'𝟳',8:'𝟴',9:'𝟵'
    };
    return text.split("").map(c => map[c] || c).join("");
  }
};

function parseSSEResponse(raw) {
  let result = "";

  for (const block of raw.split("\n\n")) {
    if (!block.startsWith("event: message")) continue;

    const match = block.match(/data: (.*)/);
    if (!match) continue;

    try {
      const json = JSON.parse(match[1]);
      if (json.content) result += json.content;
    } catch {}
  }

  return result;
}

exports.onStart = async (req, res) => {
  const q = req.query.q;
  if (!q) {
    return res.status(400).json({
      status: false,
      message: "Missing query parameter: q"
    });
  }

  try {
    const response = await axios.post(
      "https://www.goody2.ai/send",
      JSON.stringify({ message: q, debugParams: null }),
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Content-Type": "text/plain",
          "Origin": "https://www.goody2.ai",
          "Referer": "https://www.goody2.ai/chat"
        },
        responseType: "text"
      }
    );

    const text = parseSSEResponse(response.data);
    const formatted = text.replace(/\*\*(.*?)\*\*/g, (_, t) => font.bold(t));

    res.json({
      status: true,
      response: formatted
    });

  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Service unavailable",
      error: err.message
    });
  }
};