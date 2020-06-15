const options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: "YourBotsTwitchNameHere",
        password: "oauth:twitchacountauthnumber"
    },
    channels: ['elandi', 'au_matty', 'vicetfz']
};


module.exports = options;