function FindTempusRecordPlayer(Id) {
    const fs = require('fs');
    let nicknames = JSON.parse(fs.readFileSync('./nicknames.json'));
    return nicknames.find(p =>
        p.steamId == Id
    );
}
function FindPlayer(name, DBplayers) {
    return DBplayers.find(p =>
        p.aliases == name.toLowerCase()
    );
}
function FindPlayerFromChannel(channelName, DBplayers) {
    return DBplayers.find(p => {
        if (p.channel) {
            return '#' + p.channel.toLowerCase() == channelName.toLowerCase()
        }
    });
}

function OrderChannels(players, options) {
    listOfPlayers = [];
    players.forEach(p => {
        if (p.channel) {
            listOfPlayers.push(p.channel)
        }
    })
    options.channels = listOfPlayers;
}
module.exports = {
    OrderChannels,
    FindTempusRecordPlayer,
    FindPlayer,
    FindPlayerFromChannel
}
