const arpScanner = require('arpscan/promise');

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

exports.discoverMiners =  function() {
    /*
    await arpScanner(onResult, arpScannerSettings);
    function onResult(err, data) {
        if (err) {
            console.log("Scanning error");
            return [];
        }
        //console.log("Scanner return: \n" + JSON.stringify(data));
        const str =  JSON.stringify(data);
        return JSON.parse(str);
    }
    */
    arpScanner(arpScannerSettings)
        .then(onResult)
        .catch(onError);

    function onResult(data) {
        const str =  JSON.stringify(data);
        return JSON.parse(str);
    }

    function onError(err) {
        return [];
    }
};