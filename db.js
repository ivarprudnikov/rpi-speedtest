const config = require('./config');
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region: config.dynamo.region
});

function escape (val) {
  return (val + '').replace(/[^a-z0-9_-]+/ig, '-');
}

function dynamoParams (device, payload) {
  const item = {
    deviceId: escape(device),
    timestamp: new Date().getTime(),
    payload: payload
  };

  return {
    TableName: config.dynamo.table,
    Item: AWS.DynamoDB.Converter.marshall(item)
  };
}

function insertRow (device, payload) {
  return new Promise((resolve, reject) => {
    ddb.putItem(dynamoParams(device, payload), function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  insertRow
};
