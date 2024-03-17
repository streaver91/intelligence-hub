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
      const openaiMessages =
        transformMessages(messages, Object.values(openaiAdapter.ASSISTANT_NAME));
      const claudeMessages =
        transformMessages(messages, Object.values(claudeAdapter.ASSISTANT_NAME));
      await Promise.all([
        openaiAdapter.generate(openaiMessages, mode, socket),
        claudeAdapter.generate(claudeMessages, mode, socket),
        googleAdapter.search(utils.deepCopy(openaiMessages), mode, socket),
      ]);
      socket.emit('response', { type: 'end' });
    });
  });
};

module.exports = createSocket;