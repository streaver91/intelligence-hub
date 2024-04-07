const openaiAdapter = require('./openai_adapter');
const claudeAdapter = require('./claude_adapter');

const generateWithAdapter = async (adapter, messages, socket) => {
  try {
    await adapter.generate(messages, socket);
  } catch (error) {
    socket.emit('response', {
      type: 'full',
      assistant: adapter.assistantName(messages),
      content: 'Error: ' + error.message,
    });
  }
};

const createSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('generate', async (messages) => {
      socket.emit('response', {
        type: 'init',
        content: {
          [openaiAdapter.assistantName(messages)]: '',
          [claudeAdapter.assistantName(messages)]: '',
        }
      });
      await Promise.all([
        generateWithAdapter(openaiAdapter, messages, socket),
        generateWithAdapter(claudeAdapter, messages, socket),
      ]);
      socket.emit('response', { type: 'end' });
    });
  });
};

module.exports = createSocket;