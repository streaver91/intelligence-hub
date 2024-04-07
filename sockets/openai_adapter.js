const openai = require('openai');

const MODEL = {
  'eco': 'gpt-3.5-turbo',
  'pro': 'gpt-4-turbo-preview',
  'vision': 'gpt-4-vision-preview' // GPT-3.5 doesn't support vision.
};

const ASSISTANT_NAME = {
  'eco': 'CHATGPT 3.5',
  'pro': 'CHATGPT 4',
  'vision': 'CHATGPT 4 Vision'
};

const getMode = (messages) => {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.image?.startsWith('data:image')) {
    return 'vision';
  }
  return lastMessage.mode === 'pro' ? 'pro' : 'eco';
};

const getContent = (message, mode) => {
  if (mode !== 'vision') {
    return message.content;
  }
  const content = [
    { type: 'text', text: message.content },
  ];
  if (message.image?.startsWith('data:image')) {
    content.push({ type: 'image_url', image_url: message.image });
  }
  return content;
};

const transformMessages = (messages, mode) => {
  assistantNames = Object.values(ASSISTANT_NAME);
  const queryMessages = [];
  for (const message of messages.slice(-7)) {
    if (message.role === 'user') {
      queryMessages.push({
        role: 'user',
        content: getContent(message, mode),
      });
    } else if (message.role === 'assistants') {
      for (const [assistant, content] of Object.entries(message.content)) {
        if (assistantNames.includes(assistant)) {
          queryMessages.push({
            role: 'assistant',
            content: getContent({ content: content }, mode),
          });
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
  const client = new openai.OpenAI();
  const mode = getMode(messages);
  const assistantName = ASSISTANT_NAME[mode];
  const stream = await client.chat.completions.create({
    messages: transformMessages(messages, mode),
    model: MODEL[mode],
    stream: true,
  });
  for await (const chunk of stream) {
    if (!socket.connected) {
      stream.controller.abort();
      break;
    }
    const data = {
      type: 'delta',
      assistant: assistantName,
      content: chunk.choices[0]?.delta?.content || '',
    };
    socket.emit('response', data);
  }
};
