const { PORT = 3000 } = process.env;
const db = require('./db');
const config = require('./config');
const express = require('express');
const app = express();
const http = require('http');
const util = require('util');
const path = require('path');
const favicon = require('serve-favicon');
const getRawBody = require('raw-body');
const SERVER_ERROR = 500;
const UNPROCESSABLE_ENTITY = 422;
const NOT_FOUND = 404;
const CREATED = 201;
const ERROR = 400;

const server = module.exports = http.createServer(app);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'www/views'));
app.use('/static', express.static(path.join(__dirname, 'www/public')));
app.use(favicon(path.join(__dirname, 'www/public', 'favicon.ico')));

// Landing page
app.get(['/', '/index.html'], (req, res) => res.render('index'));

/**
 * Render response from DynamoDB inside of svg image
 */
app.get('/chart.svg', async (req, res) => {
  let dynamoResponse;
  // eslint-disable-next-line no-useless-catch
  try {
    dynamoResponse = await db.listRecent(config.api.device);
  } catch (err) {
    throw err;
  }
  const items = dynamoResponse.Items || [];
  let maxSpeed = 1;
  for (let i = 0; i < items.length; i++) {
    if (items[i].payload.mbpsDown > maxSpeed) {
      maxSpeed = items[i].payload.mbpsDown;
    }
  }
  const data = items.map(item => {
    return {
      speed: item.payload.mbpsDown,
      time: new Date(item.timestamp).toGMTString(),
      percent: item.payload.mbpsDown / maxSpeed * 100
    };
  });

  res.header('Content-Type', 'image/svg+xml');
  res.render('svg', { data });
});

/**
 * Store posted data in DynamoDB
 */
app[config.api.method](config.api.speedPath, (req, res) => {
  getRawBody(req, { limit: config.api.maxBytes })
    .then(function (buf) {
      let payload;
      try {
        payload = JSON.parse(buf.toString());
      } catch (e) {
        res.statusCode = UNPROCESSABLE_ENTITY;
        res.end();
        return;
      }
      return db.insertRow(payload.device, payload.data)
        .then(() => {
          res.statusCode = CREATED;
          res.end();
        });
    })
    .catch(function (err) {
      res.statusCode = err.statusCode || ERROR;
      res.end(err && err.message);
    });
});

// Error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const code = err.status || SERVER_ERROR;
  if (code >= 500) {
    console.log((new Date()).toISOString(), '[ERROR]', util.inspect(err));
  }
  res.statusCode = NOT_FOUND;
  res.end();
});

if (!module.parent) {
  server.listen(PORT);
}
