const openaiAdapter = require('./openai_adapter');
const claudeAdapter = require('./claude_adapter');
const googleAdapter = require('./google_adapter');

const transformMessages = (messages) => {
  const result = [];
  let lastUserMessage = null;
  for (const message of messages) {
    if (message.role === 'user') {
      result.push(message);
      lastUserMessage = message;
      continue;
    }
    if (message.role === 'assistants') {
      for (const [assistant, content] of Object.entries(message.content)) {
        if (typeof content !== 'string' || content.length === 0) {
          continue;
        }
        if (result[result.length - 1]?.role === 'assistant') {
          result.push(lastUserMessage);
        }
        result.push({ role: 'assistant', content: content });
      }
    }
  }
  return result;
};

const createSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('generate', async (messages) => {
      const transformedMessages = transformMessages(messages);
      try {
        await Promise.all([
          openaiAdapter.generate(transformedMessages, socket),
          claudeAdapter.generate(transformedMessages, socket),
          googleAdapter.search(transformedMessages, socket),
        ]);
        socket.emit('response', 'END');
      } catch (error) {
        console.error('Error generating text:', error);
        socket.emit('error', 'Failed to generate text');
      }
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};

module.exports = createSocket;