var request = require('request');

exports.readStats = function(host, mac, port=80, username='root', password='root', callback) {

    request.get('http://' + host + ':' + port + '/cgi-bin/get_miner_status.cgi', {
        'auth': {
            'user': username,
            'pass': password,
            'sendImmediately': false
        }
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
                ip: host,
                mac: mac,
                worker: jsonBody['pools'][0]['user'],
                timestamp: new Date(new Date().getTime() + 28800000)
            };
            var resList = [];
            resList.push(tempJSON);

            resList.push(jsonBody);

            callback(null, resList);
        } catch (e) {
            callback(error, {});

        }
    });

};