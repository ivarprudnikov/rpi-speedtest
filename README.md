# rpi-speedtest
Network speedtest script to be run on Raspberry Pi

## On Raspberry

*Installation*

- `$ git clone $url/rpi-speedtest.git`
- `$ cd rpi-speedtest`
- `$ npm i`

*Verify it works*

```shell script
$ node bin/index.js
91.40834570638205
ok 200
```

*Setup CRON*

- Open editor mode `crontab -e`
- Add something like `15 * * * * node /home/pi/rpi-speedtest/bin/index.js` to run the script every 15th minute

*Caveats*

- I was testing on _Raspbian_ which has cron logs disabled by default, make your call, for me it is not necessary.
- I did have `node` and `npm` preinstalled on _Raspbian_, make sure you have those available on PATH.

## API deployment

Uses `up` to set up AWS Lambda, config lives in `up.json`. Refer to their docs for further usage info in docs [apex.sh/docs/up/](https://apex.sh/docs/up/) or in their repo [github.com/apex/up](https://github.com/apex/up)
