const axios = require('axios');
const openai = require('openai');

const API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;
const API_ENDPOINT = 'https://www.googleapis.com/customsearch/v1';
const MAX_RESULTS = {
  eco: 3,
  pro: 5,
};
const QUERY_PROMPT = 'Create a google search query for relavant info.'
  + ' Return a json object with field "query".'

module.exports.ASSISTANT_NAME = 'Google Search';

module.exports.search = async (messages, mode, socket) => {
  const rawQuery = messages[messages.length - 1].content;
  const openaiClient = new openai.OpenAI();
  messages.push({ role: 'user', 'content': QUERY_PROMPT });
  const chatCompletion = await openaiClient.chat.completions.create({
    messages: messages,
    model: 'gpt-3.5-turbo',
    response_format: { type: 'json_object' },
  });
  if (!socket.connected) {
    return;
  }
  const chatCompletionContent = chatCompletion.choices[0]?.message?.content || '{}';
  const revisedQuery = JSON.parse(chatCompletionContent).query || rawQuery;
  const query = encodeURIComponent(revisedQuery);
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
