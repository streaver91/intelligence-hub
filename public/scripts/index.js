'use strict';

window.onload = async () => {
  let database = null;
  const openDatabase = async () => {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open("myDatabase", 1);
      request.onupgradeneeded = function (event) {
        const database = event.target.result;
        const objectStore = database.createObjectStore("myObjectStore", { keyPath: "key" });
      };
      request.onsuccess = function (event) {
        const database = event.target.result;
        resolve(database);
      };
      request.onerror = function (event) {
        reject("Error opening IndexedDB");
      };
    });
  };

  const loadConversations = async () => {
    const transaction = database.transaction(["myObjectStore"], "readonly");
    const objectStore = transaction.objectStore("myObjectStore");
    const request = objectStore.get('messages');

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const messages = JSON.parse(event.target.result?.value || '[]');
        resolve(messages);
      };
      request.onerror = (event) => {
        resolve([]);
      };
    });
  };

  const truncateAndSaveConversation = async (messages) => {
    const CONVERSATION_RETENTION_DAYS =
      parseInt('{%= process.env.CONVERSATION_RETENTION_DAYS %}');
    const TEXT_LIMIT = 32768;
    const TIMESTAMP_LIMIT = Date.now() - 86400 * CONVERSATION_RETENTION_DAYS;
    let index;
    let textSize = 0;
    for (index = messages.length - 1; index >= 0; --index) {
      textSize += JSON.stringify(messages[index].content).length;
      if (textSize > TEXT_LIMIT || messages[index].timestamp < TIMESTAMP_LIMIT) {
        break;
      }
    }
    if (messages[index]?.role !== 'user') {
      index += 1;
    }
    messages.splice(0, index);
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('myObjectStore', 'readwrite');
      const objectStore = transaction.objectStore('myObjectStore');
      const data = {
        key: 'messages',
        value: JSON.stringify(messages),
      }
      objectStore.put(data);
    });
  };

  database = await openDatabase();
  const initialMessages = await loadConversations();

  const encodeImage = (image, maxWidth, maxHeight) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const originalWidth = image.width;
    const originalHeight = image.height;
    let newWidth = originalWidth;
    let newHeight = originalHeight;
    if (originalWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = (maxWidth / originalWidth) * originalHeight;
    }
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = (maxHeight / originalHeight) * originalWidth;
    }
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(image, 0, 0, newWidth, newHeight);
    return canvas.toDataURL();
  };

  common.createApp('#app', {
    messages: initialMessages,
    input: '',
    image: '',
    mode: 'eco',
    lastUserMessage: '',
    lastUserImage: '',
    socket: null,
  }, {
    switchMode() {
      this.mode = this.mode === 'eco' ? 'pro' : 'eco';
      this.$refs.focus.focus();
      if (this.input.length === 0) {
        this.input = this.lastUserMessage;
        this.image = this.lastUserImage;
        this.$nextTick(() => {
          this.$refs.focus.select();
        });
      }
    },
    async send() {
      if (this.input === '' && this.image !== '') {
        this.input = ' [image]';
      }
      if (this.input === '') {
        return;
      }
      if (this.input === 'clear') {
        this.messages = [];
        this.input = '';
        this.image = '';
        this.lastUserMessage = '';
        this.lastUserImage = '';
        await truncateAndSaveConversation(this.messages, database);
        return;
      }
      if (this.pending.app) {
        return;
      }
      this.messages = await loadConversations();
      this.pending.app = true;
      delete this.oops.app;
      this.messages.push({
        role: 'user',
        content: this.input,
        image: this.image,
        mode: this.mode,
        timestamp: Date.now(),
      });
      this.lastUserMessage = this.input;
      this.lastUserImage = this.image;
      this.$nextTick(() => {
        this.$refs.scroll.scrollTop = this.$refs.scroll.scrollHeight;
      });
      this.input = '';
      this.image = '';
      this.socket = io();
      this.socket.on('connect', () => {
        this.socket.emit('generate', this.messages);
      });
      let content = null;
      this.socket.on('response', async (data) => {
        if (data.type === 'init') {
          this.messages.push({
            role: 'assistants',
            content: data.content,
            timestamp: Date.now(),
          });
          content = this.messages[this.messages.length - 1].content;
          this.$nextTick(() => {
            this.$refs.scroll.scrollTop = this.$refs.scroll.scrollHeight;
          });
          return;
        }
        if (data.type === 'end') {
          this.socket.disconnect();
          await truncateAndSaveConversation(this.messages, database);
          return;
        }
        if (data.type === 'delta') {
          content[data.assistant] += data.content;
          return;
        }
        if (data.type === 'full') {
          content[data.assistant] = data.content;
        }
      });
      this.socket.on('disconnect', () => {
        delete this.pending.app;
      });
    },
    stop() {
      this.socket.disconnect();
      this.$refs.focus.focus();
      this.input = this.lastUserMessage;
      this.image = this.lastUserImage;
      this.$nextTick(() => {
        this.$refs.focus.select();
      });
    },
    attachImage() {
      const imageInput = document.createElement('input');
      imageInput.type = 'file';
      imageInput.accept = 'image/*';
      const app = this;
      imageInput.addEventListener('change', () => {
        const reader = new FileReader();
        reader.onload = (file) => {
          const image = new Image();
          image.src = file.target.result;
          image.onload = () => {
            app.image = encodeImage(image, 768, 768);
            app.$refs.focus.focus();
          }
        }
        reader.readAsDataURL(imageInput.files[0]);
      });
      imageInput.click();
    },
    openImageInNewTab(data) {
      const imageUrl = data;
      const newWindow = window.open();
      newWindow.document.write(`<img src="${imageUrl}" alt="Image">`);
    },
  });
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
    });
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js');
    });
  });
}

navigator.serviceWorker.ready.then(registration => {
  const updateThemeColor = async () => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeColor = isDarkMode ? '#000000' : '#ffffff';

    const manifestUrl = '/manifest.json';
    const manifestResponse = await fetch(manifestUrl);
    const manifestJson = await manifestResponse.json();
    manifestJson.theme_color = themeColor;
    manifestJson.background_color = themeColor;
    const cache = await caches.open('manifest');
    await cache.put(manifestUrl, new Response(JSON.stringify(manifestJson), {
      headers: { 'Content-Type': 'application/json' }
    }));

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    metaThemeColor.setAttribute('content', themeColor);
  };

  updateThemeColor();

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateThemeColor);
});
