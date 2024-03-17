const anthropic = require('@anthropic-ai/sdk');

const MODEL = {
  'eco': 'claude-3-sonnet-20240229',
  'pro': 'claude-3-opus-20240229',
};

module.exports.ASSISTANT_NAME = {
  'eco': 'Claude 3 Sonnet',
  'pro': 'Claude 3 Opus',
};

module.exports.generate = async (messages, mode, socket) => {
  const client = new anthropic.Anthropic();
  const stream = await client.messages.create({
    max_tokens: 1024,
    messages: messages,
    model: MODEL[mode],
    stream: true,
  });
  const assistantName = this.ASSISTANT_NAME[mode];
  for await (const chunk of stream) {
    const data = {
      type: 'delta',
      assistant: assistantName,
      content: chunk.delta?.text || "",
    };
    socket.emit('response', data);
  }
};

