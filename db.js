const config = require('./config');
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region: config.dynamo.region
});

/**
 * Remove special chars
 * @param val
 * @return {string}
 */
function escape (val) {
  return (val + '').replace(/[^a-z0-9_]+/ig, '-');
}

/**
 * Insert data into DynamoDB
 * @param device {string}
 * @param payload {Object}
 * @return {Promise}
 */
function insertRow (device, payload) {
  return new Promise((resolve, reject) => {
    const item = {
      deviceId: escape(device),
      timestamp: new Date().getTime(),
      payload: payload
    };
    ddb.putItem({
      TableName: config.dynamo.table,
      Item: AWS.DynamoDB.Converter.marshall(item)
    }, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * List most recent entries
 * @param device {string}
 * @return {Promise<DynamoDB.Types.QueryOutput>}
 */
function listRecent (device) {
  return new Promise((resolve, reject) => {
    const d1 = new Date();
    d1.setDate(d1.getDate() - 7);
    const d2 = new Date();
    ddb.query({
      TableName: config.dynamo.table,
      Select: 'ALL_ATTRIBUTES',
      ScanIndexForward: false,
      KeyConditionExpression: '#id = :id and #time between :A and :B',
      ExpressionAttributeNames: {
        '#id': 'deviceId',
        '#time': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':id': { S: escape(device) },
        ':A': { N: d1.getTime() + '' },
        ':B': { N: d2.getTime() + '' }
      }
    }, function (err, data) {
      if (err) {
        reject(err);
      } else {
        const items = data.Items.map(item => AWS.DynamoDB.Converter.unmarshall(item))
        data.Items = items;
        resolve(data);
      }
    });
  });
}

module.exports = {
  insertRow, listRecent
};
