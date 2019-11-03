const speedTest = require('speedtest-net');
const config = require('../config.json');
const https = require('https');

module.exports = async function test (opts) {
  return new Promise((resolve, reject) => {
    const test = speedTest({ maxTime: 3000 });

    test.on('downloadspeed', speed => {
      if (opts && opts.raw) {
        console.log(speed);
      } else {
        console.log('Download speed:', speed.toFixed(2), 'Mbps');
      }
      if (opts && opts.send) {
        postSpeedToApi(speed)
          .then(resolve)
          .catch(reject);
      } else {
        resolve(speed);
      }
    });

    test.on('error', reject);
  });
};

async function postSpeedToApi (speed) {
  const data = JSON.stringify({
    device: config.api.device,
    data: {
      mbpsDown: speed
    }
  });

  const options = {
    hostname: config.api.host,
    path: config.api.speedPath,
    method: config.api.method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return httpsPost(options, data);
}

async function httpsPost (options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve(res.statusCode);
      } else {
        reject(res.statusCode);
      }
    });
    req.write(data);
    req.on('error', (e) => {
      reject(e);
    });
    req.end();
  });
}
