var request = require('request');
const config = require('../config');

const farmLocation = config.farm.farmLocation;

exports.readStats = function(host, mac, port=80, username='root', password='root', callback) {

    request.get('http://' + host + ':' + port + '/cgi-bin/get_miner_status.cgi', {
        'auth': {
            'user': username,
            'pass': password,
            'sendImmediately': false
        },
        'timeout': 5000
    }, function (error, response, body) {
        if(error)
        {
            callback(error, {});
            return;
        }
        try {
            // remove excess terminate chars
            var re = /\0/g;
            var str = body.toString().replace(re, "");

            var jsonBody = JSON.parse(str);


            var tempJSON = {
                location: farmLocation,
                ip: host,
                mac: mac,
                worker: jsonBody['pools'][0]['user'],
                timestamp: new Date(new Date().getTime() + 28800000)
            };
            var resList = [];
            resList.push(tempJSON);

            jsonBody.general = tempJSON;
            resList.push(JSON.stringify(jsonBody));

            callback(null, resList);
        } catch (e) {
            callback(error, {});

        }
    });

};