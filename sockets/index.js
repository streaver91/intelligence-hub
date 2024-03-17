const openaiAdapter = require('./openai_adapter');
const claudeAdapter = require('./claude_adapter');
const googleAdapter = require('./google_adapter');

const generate = async (messages, assistantAdapter, mode, socket) => {
  const queryMessages = [];
  assistantNames = Object.values(assistantAdapter.ASSISTANT_NAME);
  for (const message of messages.slice(-7)) {
    if (message.role === 'user') {
      queryMessages.push({ role: 'user', content: message.content });
      continue;
    }
    if (message.role === 'assistants') {
      for (const [assistant, content] of Object.entries(message.content)) {
        if (assistantNames.includes(assistant)) {
          queryMessages.push({ role: 'assistant', content: content });
          break;
        }
      }
    }
  }
  await assistantAdapter.generate(queryMessages, mode, socket);
};

const createSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('generate', async (messages) => {
      const mode = messages[messages.length - 1].mode === 'pro' ? 'pro' : 'eco';
      socket.emit('response', {
        type: 'init',
        content: {
          [googleAdapter.ASSISTANT_NAME]: '',
          [openaiAdapter.ASSISTANT_NAME[mode]]: '',
          [claudeAdapter.ASSISTANT_NAME[mode]]: '',
        }
      });
      await Promise.all([
        generate(messages, openaiAdapter, mode, socket),
        generate(messages, claudeAdapter, mode, socket),
        googleAdapter.search(messages, mode, socket),
      ]);
      socket.emit('response', { type: 'end' });
    });
  });
};

module.exports = createSocket;