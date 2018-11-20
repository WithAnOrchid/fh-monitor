const farmLocation = 'guyi';
//const farmLocation = 'shuikou';

const config = {
    debug: true,
    miner:{
        minerPort: 80,
        minerUser: 'root',
        minerPass: 'root'
    },
    farm: {
        farmLocation: farmLocation,
        farmAdmin: 'liudi@dr.com',
        totalMiners: 30
    },
    iot: {
        host: 'a26ktsy790d3lc-ats.iot.ap-southeast-1.amazonaws.com',
        caPath: './cert/root-CA.crt',
        keyPath: './cert/' + farmLocation + '_dev.private.key',
        certPath: './cert/' + farmLocation + '_dev.cert.pem',
        clientId: farmLocation,
        generalInfoPublishTo: farmLocation + '/generalinfo',
        minerDetailsPublishTo: farmLocation + '/minerdetails',
        controlSubscribeTo: farmLocation + '/controlsignal',
        controlPublishTo: farmLocation + '/controlfeedback',
        scheduledPublishTo: 'fh/' + farmLocation + '/minerdetails'
    }
};
module.exports = config;
