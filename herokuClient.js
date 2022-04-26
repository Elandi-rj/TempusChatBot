const Heroku = require('heroku-client')
const heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN })

var appName = 'tempus-chat';
var dynoName = 'worker';

module.exports = {
    restart() {
        heroku.delete('/apps/' + appName + '/dynos/' + dynoName)
            .then(x => console.log(x));
    }
};

