//var IoTClient = require('./iot-client');
//var Config = require('../config');
var awsIot = require('aws-iot-device-sdk');
const {transports, createLogger, format} = require('winston');

const logger = createLogger({
    level: 'debug',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new transports.Console(),
        new transports.File({filename: 'debug.log', level: 'debug'}),
        new transports.File({filename: 'combined.log'})
    ]
});

var device = awsIot.device({
    keyPath: './cert/shuikou_dev.private.key',
    certPath: './cert/shuikou_dev.cert.pem',
    caPath: './cert/root-CA.crt',
    clientId: 'shuikou',
    host: 'a26ktsy790d3lc.iot.ap-southeast-1.amazonaws.com'
});

//
// NOTE: client identifiers must be unique within your AWS account; if a client attempts
// to connect with a client identifier which is already in use, the existing
// connection will be terminated.
//
exports.initIoT = function() {

    logger.debug('AWS IoT connecting...');


    device
        .on('connect', function () {
            logger.debug('AWS IoT connected');
            device.subscribe('shuikou' + '/control');
            device.publish('shuikou' + '/signal', JSON.stringify({status: 'connected'}));
        });

    device
        .on('error', function () {
            logger.error('AWS IoT not connected');
        });

    device
        .on('message', function (topic, payload) {
            console.log('message', topic, payload.toString());
            logger.debug('AWS IoT message received:\nTopic: ' + topic + '\npayload: ' + payload.toString());
        });

};

exports.publish = function(message) {
    device.publish('shuikou' + '', message);
};

exports.publishTo = function(topic, message) {
    device.publish('shuikou/' + topic, message);
};