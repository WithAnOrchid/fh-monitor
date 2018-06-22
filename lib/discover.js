const arpScanner = require('arpscan');

/*

https://medium.com/front-end-hacking/callbacks-promises-and-async-await-ad4756e01d90
 */

// Scan
const arpScannerSettings = {
    command: 'arp-scan',
    interface: 'eth0',
    sudo: true
};

exports.getBeijingTime = function() {
    return new Date(new Date().getTime() + 28800000);
};

exports.discoverMiners = async function() {
    async function onResult(err, data) {
        if (err) {
            console.log("Scanning error");
            return [];
        }
        //console.log("Scanner return: \n" + JSON.stringify(data));
        const str = await JSON.stringify(data);
        return JSON.parse(str);
    }
    await arpScanner(onResult, arpScannerSettings);
};