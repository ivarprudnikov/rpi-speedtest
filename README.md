# rpi-speedtest

[![Actions Status](https://github.com/ivarprudnikov/rpi-speedtest/workflows/Node%20CI/badge.svg)](https://github.com/ivarprudnikov/rpi-speedtest/actions)

Network speedtest script to be run on Raspberry Pi

## On Raspberry

### Installation

**Assumes you have API server deployed already.**

- Connect to network ([WiFi setup docs](https://www.raspberrypi.org/documentation/configuration/wireless/wireless-cli.md))
- Install NodeJS for correct ARM version (`uname -m`)
  - [Select node version binary hat supports ARM version](https://nodejs.org/en/download/)
- `$ git clone $url/rpi-speedtest.git`
- `$ cd rpi-speedtest`
- `$ npm i`
- Modify [config file](./config.json)

*Verify it works*

```shell script
$ node bin/index.js
91.40834570638205
ok 200
```

[*Setup CRON*](https://www.raspberrypi.org/documentation/linux/usage/cron.md)

- Open editor mode `crontab -e`
- Add something like `15 * * * * /usr/local/bin/node /home/pi/rpi-speedtest/bin/index.js` to run the script every 15th minute. Safest way is to puth full path to node installation.

*Caveats*

- I was testing on _Raspbian_ which has cron logs disabled by default, make your call, for me it is not necessary.
- I did have `node` and `npm` preinstalled on _Raspbian_, make sure you have those installed and available in `PATH`.

## API server

### Running locally

*AWS credentials*

Export AWS credentials for DynamoDB queries/inserts to work locally:
- Use profile: 
```
$ export AWS_PROFILE=myprofilename
```
- or use key/secret 
```
$ export AWS_ACCESS_KEY_ID=xxx
$ export AWS_SECRET_ACCESS_KEY=yyy
```
- or whatever else AWS tells you to use with its SDKs

*API server*

To start locally `$ npm start`

### Testing

To test `$ npm test` which will run eslint and any tests present

### Deployment

- Modify [config file](./up.json)
- To deploy to production run `$ up production`

Uses `up` to set up AWS Lambda, config lives in `up.json`. Refer to their docs for further usage info in docs [apex.sh/docs/up/](https://apex.sh/docs/up/) or in their repo [github.com/apex/up](https://github.com/apex/up)

## DynamoDB

Expecting simple table holding `deviceId` as a main partition key combined with a sort key `timestamp` and actual data sitting in `payload` column which expects Map structure.

```
Primary partition key
	deviceId (String)
Primary sort key
	timestamp (Number)
Read/write capacity mode
	On-Demand
```
