const http = require('http');
const getRawBody = require('raw-body');
const { PORT = 3000 } = process.env;
const config = require('./config');
const UNPROCESSABLE_ENTITY = 422;
const NOT_FOUND = 404;
const CREATED = 201;
const ERROR = 400;

function isEndpoint (req) {
  const { url, method } = req;
  const reqUrlPath = url.split('?')[0].split('#')[0];
  return reqUrlPath === config.api.speedPath && method === config.api.method.toUpperCase();
}

const server = module.exports = http.createServer((req, res) => {
  if (isEndpoint(req)) {
    getRawBody(req, { limit: config.api.maxBytes })
      .then(function (buf) {
        try {
          JSON.parse(buf.toString());
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
