const anthropic = require('@anthropic-ai/sdk');

const MODEL = {
  'eco': 'claude-3-sonnet-20240229',
  'pro': 'claude-3-opus-20240229',
};

const ASSISTANT_NAME = {
  'eco': 'Claude 3 Sonnet',
  'pro': 'Claude 3 Opus',
};

const getMode = (messages) => {
  const lastMessage = messages[messages.length - 1];
  return lastMessage.mode === 'pro' ? 'pro' : 'eco';
};

const transformMessages = (messages) => {
  assistantNames = Object.values(ASSISTANT_NAME);
  queryMessages = [];
  for (const message of messages.slice(-7)) {
    if (message.role === 'user') {
      if (!message.image?.startsWith('data:image')) {
        queryMessages.push({ role: 'user', content: message.content });
        continue;
      }
      const content = [{ type: 'text', text: message.content }];
      const [metaData, data] = message.image.split(',');
      const mediaType = metaData.split(';')[0].split(':')[1];
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: data,
        }
      });
      queryMessages.push({
        role: 'user',
        content: content,
      });
    } else if (message.role === 'assistants') {
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

module.exports.assistantName = (messages) => {
  return ASSISTANT_NAME[getMode(messages)];
}

module.exports.generate = async (messages, socket) => {
  const client = new anthropic.Anthropic();
  const mode = getMode(messages);
  const assistantName = ASSISTANT_NAME[mode];
  const request = {
    max_tokens: 1024,
    messages: transformMessages(messages),
    model: MODEL[mode],
    stream: true,
  };
  const stream = await client.messages.create(request);
  for await (const chunk of stream) {
    if (!socket.connected) {
      stream.controller.abort();
      break;
    }
    const data = {
      type: 'delta',
      assistant: assistantName,
      content: chunk.delta?.text || '',
    };
    socket.emit('response', data);
  }
};
