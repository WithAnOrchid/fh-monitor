var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var debug = require('debug')('untitled1:server');
var discover = require('../lib/discover');
// socket.io


const {transports, createLogger, format} = require('winston');

const frequency = '*/30 * * * * *';


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

/* Discover round
 * This round runs every 10 minutes
 * Contains scanningRound()
 *  */
async function discoverRound() {
    require('dns').resolve('baidu.com', async function (err) {
        if (err) {
            logger.error('Cannot connect to Internet.');

        } else {
            // discover
            var minerList = await discover.discoverMiners();
            logger.debug(minerList);
            // Now should scan for each one
            
        }
    });

}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('running', {title: 'FH-Monitor'});
    var j = schedule.scheduleJob(frequency, function(){
        logger.info('Starting new round');
        discoverRound()
    });
});


module.exports = router;
