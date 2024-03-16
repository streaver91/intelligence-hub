require('dotenv').config();

const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const createSocket = require('./sockets/index');

const PORT = process.env.PORT;

const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server);

app.set('x-powered-by', false);
app.set('view engine', 'ejs');
app.set('view options', { openDelimiter: '{', closeDelimiter: '}' });
app.set('views', path.join(__dirname, '/dist/views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cookieSession({ secret: process.env.SESSION_SECRET }));

app.use('/', express.static(path.join(__dirname, 'dist/public'), {
  maxAge: '1d'
}));

app.use('/', indexRouter);
app.use('/user', userRouter);

createSocket(io);

server.listen(PORT, () => {
  console.log(`Intelligence Hub listening on port ${PORT}`);
});
