var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var debug = require('debug')('untitled1:server');
var discover = require('../lib/discover');
var scan = require('../lib/scan');
var iot = require('../lib/iot.js');


const {transports, createLogger, format} = require('winston');

//const discoveryFrequency = '*/30 * * * * *';
const discoveryFrequency = '*/5 * * * *';
const scanningFrequency = '*/30 * * * * *';
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


// TODO NEW
iot.initIoT();

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

            logger.info('***Starting Scanning Round***');

            discover.discoverMiners( async function (res) {
                var addresses = JSON.stringify(res);
                var deviceList = JSON.parse(addresses);
                logger.debug('Device list: ' + addresses);
                var minerList = [];
                //console.log(deviceList);
                //console.log(deviceList.length);

                var counter = 0;
                for (var i = 0; i < deviceList.length; i++) {

                    var parsedMiner = deviceList[i];
                    //console.log(parsedMiner);
                    var minerIP = parsedMiner.ip;
                    var minerMAC = parsedMiner.mac;
                    logger.debug('Looking at: ' + minerIP);

                    scan.readStats(minerIP, minerMAC, minerPort, minerUser, minerPass,  (err, resList) => {
                        if (err) {
                            // Maybe not an Antminer
                            logger.error('Cannot read miner stats: ' + err);
                            counter++;

                            // Modify the list of know devices
                        } else {
                            counter++;
                            if(resList[1].length > 2){
                                minerList.push(resList[0]);

                                logger.debug('Miner list length: ' + minerList.length);
                                logger.debug(resList[0]);
                                iot.publishMinerDetails(resList[1]);
                            }

                            //logger.debug(resList[1]);


                            if(counter === deviceList.length-1){
                                logger.debug('List should be complete');
                                logger.debug('Final list length: ' + minerList.length);
                                iot.publishGeneralInfo(JSON.stringify(minerList));
                            }
                        }
                    })
                }



            });

        }
    });

}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('running', {title: 'FH-Monitor'});
    var discoverRoundScheduler = schedule.scheduleJob(discoveryFrequency, function(){
        logger.info('***Starting Discover Round***');
        discoverRound();
    });
});


module.exports = router;