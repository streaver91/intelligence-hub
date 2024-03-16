const openai = require('openai');

const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const API_KEY = process.env.OPENAI_API_KEY;
const model = 'gpt-3.5-turbo';
const AGENT_NAME = 'ChatGPT 4';

async function generate(messages, socket) {
  const client = new openai.OpenAI();
  const stream = await client.chat.completions.create({
    messages: messages,
    model: "gpt-3.5-turbo",
    stream: true,
  });
  for await (const chunk of stream) {
    const data = {
      type: 'delta',
      [AGENT_NAME]: chunk.choices[0]?.delta?.content || "",
    };
    socket.emit('response', data);
  }
  console.log('Stream ended.');
};

module.exports.generate = generate;
