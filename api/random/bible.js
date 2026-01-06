/**
 * API Endpoint Template
 * ---------------------
 * File: api/random/bible.js
 * URL : /random/bible
 */

const axios = require("axios");

exports.meta = {
  name: "Random Bible Verse",
  description: "Get a random Bible verse",
  category: "random",
  method: "GET"
};

exports.onStart = async (req, res) => {
  try {
    const response = await axios.get(
      "https://bible-api.com/?random=verse&translation=web"
    );

    const { text, reference } = response.data;

    res.json({
      status: true,
      reference,
      verse: text.trim()
    });

  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch Bible verse"
    });
  }
};