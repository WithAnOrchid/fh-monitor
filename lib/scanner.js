const arpScanner = require('arpscan');
const winston = require('winston');

/*
    Logging
*/
const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new (winston.transports.Console)({'timestamp': true}),
        new winston.transports.File({filename: 'debug.log', level: 'debug'}),
        new winston.transports.File({filename: 'combined.log'})
    ]
});

function getBeijingTime() {
    return new Date(new Date().getTime() + 28800000);
}

