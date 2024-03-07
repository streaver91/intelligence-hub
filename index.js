const express = require('express');
const path = require('path')

const indexRouter = require('./routes/index');

const port = process.env.PORT;

const app = express();

app.set('view engine', 'ejs');
app.set('view options', { openDelimiter: '{', closeDelimiter: '}' });
app.set('views', path.join(__dirname, '/dist/views'));

app.use('/', express.static(path.join(__dirname, 'public'), {
  maxAge: '1d'
}));

app.use('/', indexRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
