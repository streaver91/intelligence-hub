const axios = require('axios');

const API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;
const AGENT_NAME = 'Google Search';
const API_ENDPOINT = 'https://www.googleapis.com/customsearch/v1';
const NUM_RESULTS = 3;

async function search(messages, socket) {
  const query = encodeURIComponent(messages[messages.length - 1].content);
  const url = `${API_ENDPOINT}?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${query}`;
  const response = await axios.get(url);
  const data = response.data;
  const results = [];
  for (const item of data.items.slice(0, NUM_RESULTS)) {
    results.push({
      title: item.title,
      link: item.link,
      displayLink: item.displayLink,
      snippet: item.snippet,
    });
  }
  const responseMessage = {
    type: 'search',
    [AGENT_NAME]: results,
  };
  socket.emit('response', responseMessage);
};

module.exports.search = search;

async function generate(messages, socket) {
  const client = new anthropic.Anthropic();
  const stream = await client.messages.create({
    max_tokens: 1024,
    messages: messages,
    model: 'claude-3-sonnet-20240229',
    stream: true,
  });
  for await (const chunk of stream) {
    const data = {
      type: 'delta',
      [AGENT_NAME]: chunk.delta?.text || "",
    };
    socket.emit('response', data);
  }
  console.log('Stream ended.');
};

module.exports.generate = generate;
