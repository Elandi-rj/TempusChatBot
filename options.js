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
        youtubeApi: "YoutubeApiKey"
    },
    channels: []
};


module.exports = options;
