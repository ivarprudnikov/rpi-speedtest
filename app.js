const { PORT = 3000 } = process.env;
const db = require('./db');
const config = require('./config');
const express = require('express');
const app = express();
const http = require('http');
const util = require('util');
const getRawBody = require('raw-body');
const SERVER_ERROR = 500;
const UNPROCESSABLE_ENTITY = 422;
const NOT_FOUND = 404;
const CREATED = 201;
const ERROR = 400;

const server = module.exports = http.createServer(app);

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
