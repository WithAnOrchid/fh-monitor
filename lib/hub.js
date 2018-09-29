var discover = require('../lib/discover');
var scan = require('../lib/scan');
var iot = require('../lib/iot.js');
const config = require('../config');

const {transports, createLogger, format} = require('winston');


const minerPort = config.miner.minerPort;
const minerUser = config.miner.minerUser;
const minerPass = config.miner.minerPass;

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

exports.discoverRound = function (caller) {
    require('dns').resolve('baidu.com',  function (err) {
        if (err) {
            logger.error('Cannot connect to Internet.');

        } else {
            // TODO scheduler

            logger.info('***Starting Scanning Round***');

            discover.discoverMiners(  function (res) {
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
                            if(resList !== undefined){
                                minerList.push(resList[0]);

                                logger.debug('Miner list length: ' + minerList.length);
                                logger.debug(resList[0]);
                                if(caller === 'scheduler'){
                                    iot.publishScheduledMinerDetails(resList[1]);
                                } else if (caller === 'remote'){
                                    iot.publishMinerDetails(resList[1]);
                                }
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

};