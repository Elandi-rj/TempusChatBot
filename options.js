const options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: "YourBotTwitchName",
        password: "oauth:twitchAuthKey",
        youtubeApi: "YotubeApiKey"
    },
    channels: ['elandi']
};


module.exports = options;
