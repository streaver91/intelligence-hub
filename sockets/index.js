const openaiAdapter = require('./openai_adapter');
const claudeAdapter = require('./claude_adapter');
const googleAdapter = require('./google_adapter');
const utils = require('../routes/utils');

const transformMessages = (messages, assistantNames) => {
  const queryMessages = [];
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
  return queryMessages;
};

const generateWithAdapter = async (adapter, messages, mode, socket) => {
  const queryMessages = transformMessages(messages, adapter.contextNames());
  try {
    await adapter.generate(queryMessages, mode, socket);
  } catch (error) {
    socket.emit('response', {
      type: 'full',
      assistant: adapter.assistantName(mode),
      content: 'Error: ' + error.message,
    });
  }
};

const createSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('generate', async (messages) => {
      const mode = messages[messages.length - 1].mode === 'pro' ? 'pro' : 'eco';
      socket.emit('response', {
        type: 'init',
        content: {
          [googleAdapter.assistantName(mode)]: '',
          [openaiAdapter.assistantName(mode)]: '',
          [claudeAdapter.assistantName(mode)]: '',
        }
      });
      await Promise.all([
        generateWithAdapter(openaiAdapter, messages, mode, socket),
        generateWithAdapter(claudeAdapter, messages, mode, socket),
        generateWithAdapter(googleAdapter, messages, mode, socket),
      ]);
      socket.emit('response', { type: 'end' });
    });
  });
};

module.exports = createSocket;