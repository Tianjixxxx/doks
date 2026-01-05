const axios = require("axios");

module.exports = {
  meta: {
    name: "Random Bible Verse",
    description: "Get a random Bible verse",
    category: "Random",
    method: "GET",
    endpoint: "/api/random/bible",
    params: [],
    response: {
      type: "json",
      example: {
        status: true,
        reference: "John 3:16",
        verse: "For God so loved the world..."
      }
    }
  },

  onStart: async ({ req, res }) => {
    try {
      const response = await axios.get(
        "https://bible-api.com/?random=verse&translation=web"
      );

      const { text: verse, reference } = response.data;

      res.status(200).json({
        status: true,
        reference,
        verse: verse.trim()
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Failed to fetch Bible verse"
      });
    }
  }
};