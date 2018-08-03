var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var debug = require('debug')('untitled1:server');
var discover = require('../lib/discover');
var scan = require('../lib/scan');
var iot = require('../lib/iot.js');



const {transports, createLogger, format} = require('winston');

const discoveryFrequency = '*/30 * * * * *';
const scanningFrequency = '*/30 * * * * *';
const minerPort = 80;
const minerUser = 'root';
const minerPass = 'root';

//const keyPath = '../shuikou_dev.private.key';
//const certPath= '../shuikou_dev.cert.pem';
//const caPath= '../root-CA.crt';
//const clientId= 'shuikou';
//const host= 'a26ktsy790d3lc.iot.ap-southeast-1.amazonaws.com';

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

                            // Modify the list of know devices
                        } else {
                            // todo July 15

                            //logger.info('Successfully read stats from ' + '');
                            //logger.debug(stats);

                            minerList.push(resList);
                            logger.debug('Miner list length: ' + minerList.length);
                            logger.debug(resList[0]);
                            iot.publish(resList[1])
                            //logger.debug("******");
                            //logger.debug(resList[1]);
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
        discoverRound()
    });
});


module.exports = router;
