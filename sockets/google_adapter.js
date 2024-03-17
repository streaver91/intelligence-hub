const axios = require('axios');

const API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;
const API_ENDPOINT = 'https://www.googleapis.com/customsearch/v1';
const MAX_RESULTS = {
  eco: 3,
  pro: 5,
};

module.exports.ASSISTANT_NAME = 'Google Search';

module.exports.search = async (messages, mode, socket) => {
  const query = encodeURIComponent(messages[messages.length - 1].content);
  const url = `${API_ENDPOINT}?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${query}`;
  const response = await axios.get(url);
  const data = response.data;
  const results = [];
  for (const item of data.items.slice(0, MAX_RESULTS[mode])) {
    results.push({
      title: item.title,
      link: item.link,
      displayLink: item.displayLink,
      snippet: item.snippet,
    });
  }
  const responseMessage = {
    type: 'full',
    assistant: this.ASSISTANT_NAME,
    content: results,
  };
  socket.emit('response', responseMessage);
};
