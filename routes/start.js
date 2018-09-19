var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var debug = require('debug')('untitled1:server');
var hub = require('../lib/hub.js');
var iot = require('../lib/iot.js');



const {transports, createLogger, format} = require('winston');

//const discoveryFrequency = '*/30 * * * * *';
const discoveryFrequency = '0 */8 * * *';
const scanningFrequency = '*/30 * * * * *';

/*
    Logging
*/

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


// TODO NEW
iot.initIoT();


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('running', {title: 'FH-Monitor'});
    var discoverRoundScheduler = schedule.scheduleJob(discoveryFrequency, function(){
        logger.info('***Starting Discover Round***');
        hub.discoverRound();
    });
});


module.exports = router;