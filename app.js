const http = require('http')
const { PORT = 3000, UP_STAGE } = process.env

http.createServer((req, res) => {
  res.end('Hello World from ' + UP_STAGE)
}).listen(PORT)

