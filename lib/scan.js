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
            JSON.parse(body);
            var tempJSON = {
                ip: host,
                mac: mac,
                timestamp: new Date(new Date().getTime() + 28800000)
            };
            var resList = [];
            resList.push(tempJSON);
            resList.push(body);

            callback(null, resList);
        } catch (e) {
            callback(error, {});

        }
    });

};