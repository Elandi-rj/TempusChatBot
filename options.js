const options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: "",
        password: "oauth:"
    },
    channels: ['elandi']
};


module.exports = options;