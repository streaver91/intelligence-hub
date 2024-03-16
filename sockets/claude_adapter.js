const anthropic = require('@anthropic-ai/sdk');

const AGENT_NAME = 'Claude 3 Opus';

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
