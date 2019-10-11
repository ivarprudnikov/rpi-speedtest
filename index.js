const speedTest = require('speedtest-net');

module.exports = function test(opts) {
  speedTest({maxTime: 3000}).on('downloadspeed', speed => {
    if (opts && opts.raw) {
      console.log(speed);
    } else {
      console.log('Download speed:', speed.toFixed(2), 'Mbps');
    }
  });
}
