const anthropic = require('@anthropic-ai/sdk');

const MODEL = {
  'eco': 'claude-3-sonnet-20240229',
  'pro': 'claude-3-opus-20240229',
};

const ASSISTANT_NAME = {
  'eco': 'Claude 3 Sonnet',
  'pro': 'Claude 3 Opus',
};

module.exports.assistantName = (mode) => ASSISTANT_NAME[mode];

module.exports.contextNames = () => Object.values(ASSISTANT_NAME);

module.exports.generate = async (messages, mode, socket) => {
  const client = new anthropic.Anthropic();
  const assistantName = this.assistantName(mode);
  const request = {
    max_tokens: 1024,
    messages: messages,
    model: MODEL[mode],
    stream: true,
  };
  if (mode === 'eco') {
    request['system'] = 'Respond concisely.'
  }
  const stream = await client.messages.create(request);
  for await (const chunk of stream) {
    if (!socket.connected) {
      stream.controller.abort();
      break;
    }
    const data = {
      type: 'delta',
      assistant: assistantName,
      content: chunk.delta?.text || "",
    };
    socket.emit('response', data);
  }
};

