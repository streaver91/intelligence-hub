const openai = require('openai');

const MODEL = {
  'eco': 'gpt-3.5-turbo',
  'pro': 'gpt-4-turbo-preview',
};

const ASSISTANT_NAME = {
  'eco': 'CHATGPT 3.5',
  'pro': 'CHATGPT 4',
};

module.exports.assistantName = (mode) => ASSISTANT_NAME[mode];

module.exports.contextNames = () => Object.values(ASSISTANT_NAME);

module.exports.generate = async (messages, mode, socket) => {
  const client = new openai.OpenAI();
  const assistantName = this.assistantName(mode);
  const stream = await client.chat.completions.create({
    messages: messages,
    model: MODEL[mode],
    stream: true,
  });
  for await (const chunk of stream) {
    if (!socket.connected) {
      stream.controller.abort();
      break;
    }
    const data = {
      type: 'delta',
      assistant: assistantName,
      content: chunk.choices[0]?.delta?.content || "",
    };
    socket.emit('response', data);
  }
};
