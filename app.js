const http = require('http');
const getRawBody = require('raw-body');
const { PORT = 3000 } = process.env;
const config = require('./config');
const UNPROCESSABLE_ENTITY = 422;
const NOT_FOUND = 404;
const CREATED = 201;
const ERROR = 400;
const S3 = require('aws-sdk/clients/s3');
const S3_BUCKET = 'payloads.lila.io';
const s3Instance = new S3({
  apiVersion: '2006-03-01',
  region: 'eu-west-1'
});

function isEndpoint (req) {
  const { url, method } = req;
  const reqUrlPath = url.split('?')[0].split('#')[0];
  return reqUrlPath === config.api.speedPath && method === config.api.method.toUpperCase();
}

function escape (val) {
  return (val + '').replace(/[^a-z0-9_-]+/ig, '-');
}

const server = module.exports = http.createServer((req, res) => {
  if (isEndpoint(req)) {
    getRawBody(req, { limit: config.api.maxBytes })
      .then(function (buf) {
        try {
          const payload = JSON.parse(buf.toString());
          const group = escape(payload.group);
          const device = escape(payload.device);
          const jsonText = JSON.stringify(payload.data);

          res.statusCode = CREATED;
        } catch (e) {
          res.statusCode = UNPROCESSABLE_ENTITY;
        }
        res.end();
      })
      .catch(function (err) {
        res.statusCode = err.statusCode || ERROR;
        res.end(err.message);
      });
  } else {
    res.statusCode = NOT_FOUND;
    res.end();
  }
});

if (!module.parent) {
  server.listen(PORT);
}
