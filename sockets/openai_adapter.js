const openai = require('openai');

const MODEL = {
  'eco': 'gpt-3.5-turbo',
  'pro': 'gpt-4-turbo-preview',
};

module.exports.ASSISTANT_NAME = {
  'eco': 'CHATGPT 3.5',
  'pro': 'CHATGPT 4',
};

module.exports.generate = async (messages, mode, socket) => {
  const client = new openai.OpenAI();
  const stream = await client.chat.completions.create({
    messages: messages,
    model: MODEL[mode],
    stream: true,
  });
  const assistantName = this.ASSISTANT_NAME[mode];
  for await (const chunk of stream) {
    const data = {
      type: 'delta',
      assistant: assistantName,
      content: chunk.choices[0]?.delta?.content || "",
    };
    socket.emit('response', data);
  }
};
