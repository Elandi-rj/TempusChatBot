const fs = require('fs');
let nicknames = JSON.parse(fs.readFileSync('./nicknames.json'));

function FindTempusRecordPlayer(Id) {

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
    }
    );
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

function steam64ToSteam2(steam64) {
    const base = BigInt("76561197960265728");
    const id = BigInt(steam64) - base;

    const y = id % 2n;
    const z = id / 2n;

    return `STEAM_0:${y}:${z}`;
}

function AddAlias(userObj) {
    if (userObj.alias) {
        let nicknameobj = {
            "steamId": steam64ToSteam2(userObj.steamId64),
            "name": userObj.alias
        }
        nicknames.push(nicknameobj);
    }
}
module.exports = {
    OrderChannels,
    FindTempusRecordPlayer,
    FindPlayer,
    FindPlayerFromChannel,
    AddAlias
}
