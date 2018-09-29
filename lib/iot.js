var awsIot = require('aws-iot-device-sdk');
var hub = require('../lib/hub');
const config = require('../config');
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
    keyPath: config.iot.keyPath,
    certPath: config.iot.certPath,
    caPath: config.iot.caPath,
    clientId: config.iot.clientId,
    host: config.iot.host
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
            device.subscribe(config.iot.controlSubscribeTo);
            device.publish(config.iot.controlPublishTo, JSON.stringify({status: 'connected'}));
        });
};

device
    .on('error', function (err) {
        logger.error('AWS IoT not connected: ', err);
    });

device
    .on('reconnect', function () {
        logger.error('AWS IoT reconnect');
    });

device
    .on('offline', function () {
        logger.error('AWS IoT offline');
    });

// TODO: handler
controlSignalHandler = function(payload) {
    if((payload) !== undefined){
        var command = JSON.parse(payload);
        if(command['command'] === 'scan'){
            hub.discoverRound('remote');
            //device.publish(config.iot.controlPublishTo, message);
        }
    }
};

device
    .on('message', function (topic, payload) {
        //console.log('message', topic, payload.toString());
        logger.debug('AWS IoT message received. Topic=' + topic + ', Payload=' + payload.toString());
        controlSignalHandler(payload);
    });

exports.publishMinerDetails = function(message) {
    device.publish(config.iot.minerDetailsPublishTo + '', message);
};

exports.publishScheduledMinerDetails = function(message) {
    device.publish(config.iot.scheduledPublishTo + '', message);
};

exports.publishGeneralInfo = function(message) {
    device.publish(config.iot.generalInfoPublishTo + '', message);
};

exports.publishTo = function(topic, message) {
    device.publish(config.farm.farmLocation + '/' + topic, message);
};