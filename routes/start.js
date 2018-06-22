var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var debug = require('debug')('untitled1:server');
var discover = require('../lib/discover');
var scan = require('../lib/scan');
// socket.io


const {transports, createLogger, format} = require('winston');

const frequency = '*/30 * * * * *';
const minerPort = 80;
const minerUser = 'root';
const minerPass = 'root';

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
            // TODO scheduler
            var deviceList = await discover.discoverMiners();
            // Store miners IP and Mac and Worker
            var minerList = {};
            logger.debug('Discover returnL\n' + deviceList);
            // Now should scan for each one
            deviceList.forEach((miner) => {
                var parsedMiner = JSON.parse(miner);
                var minerIP = parsedMiner.ip;
                scan.readStats(minerIP, minerPort, minerUser, minerPass, (err, stats) => {
                    if(err){
                        // Maybe not an Antminer
                        logger.error('Cannot read stats from ' + minerIP);
                        // Modify the list of know devices
                    } else {
                        logger.info('Successfully read stats from ' + minerIP);
                        logger.debug(stats);
                        var minerData = {
                            "ip": minerIP,
                            "mac": parsedMiner.mac,
                            "worker": JSON.parse(stats),
                            "last_seen" : parsedMiner.timestamp
                        };
                        minerList.push(minerData);
                        logger.debug('Miner list:\n' + minerList);
                    }
                })
            })
        }
    });

}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('running', {title: 'FH-Monitor'});
    var discoverRoundScheduler = schedule.scheduleJob(frequency, function(){
        logger.info('Starting new round');
        discoverRound()
    });
});


module.exports = router;
