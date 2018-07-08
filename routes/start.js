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
            //var discoverPromises =  discover.discoverMiners();
            //var str =  JSON.stringify(discoverPromises);
            //var deviceList = JSON.parse(str);
            // Store miners IP and Mac and Worker
            //var minerList = {};


            await discover.discoverMiners( function(res) {
                var addresses =  JSON.stringify(res);
                var deviceList =  JSON.parse(addresses);
                var minerList = [];
                //console.log(deviceList);
                console.log(deviceList.length);
                for(var i = 0; i < deviceList.length; i++){
                    var parsedMiner = deviceList[i];
                    console.log(parsedMiner);
                    var minerIP = parsedMiner.ip;

                    scan.readStats(minerIP, minerPort, minerUser, minerPass, (err, stats) => {
                        if(err){
                            // Maybe not an Antminer
                            logger.error('Cannot read stats from ' + minerIP);
                            // Modify the list of know devices
                        } else {
                            logger.info('Successfully read stats from ' + minerIP);
                            //logger.debug(stats);
                            var minerData = {
                                "ip": minerIP,
                                "mac": parsedMiner.mac,
                                "worker": stats,
                                "last_seen" : parsedMiner.timestamp
                            };
                            minerList.push(minerData);
                            logger.debug('Miner Data: ' + minerData);
                            logger.debug('Miner list: ' + minerList.length);
                        }
                    })
                }
                console.log(minerList);
            });




            //logger.debug('Discover returned ' + deviceList.toString());
            /*
                        // Now should scan for each one
                        for(var i = 0; i < deviceList.length; i++){
                            var parsedMiner = JSON.parse(deviceList[i]);
                            var minerIP = parsedMiner.ip;
                            console.log(parsedMiner)
                        }

                        ////

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
            */
            ////
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
