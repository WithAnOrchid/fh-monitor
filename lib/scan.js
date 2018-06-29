var request = require('request');

exports.readStats = function(host, port=80, username='root', password='root', callback) {

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
        callback(null, body);
    });

};