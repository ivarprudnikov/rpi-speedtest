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
  return {
    TableName: config.dynamo.table,
    Item: {
      deviceId: { S: escape(device) },
      timestamp: { N: new Date().getTime() },
      payload: { M: payload }
    }
  };
}

function insertRow (device, payload) {
  return new Promise((resolve, reject) => {
    ddb.putItem(dynamoParams(device, payload), function (err) {
      if (err) {
        reject(new Error('Could not store entry in database'));
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  insertRow
};
