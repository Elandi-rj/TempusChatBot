players = [
    {
        aliases: ['steve', 'arvinge'],
        id: 11020,
        channel: 'arvinge',
    }
]

function FindTempusRecordPlayer(Id) {
    const fs = require('fs');
    let nicknames = JSON.parse(fs.readFileSync('./nicknames.json'));
    return nicknames.find(p =>
        p.steamId == Id
    );
}
function FindPlayer(name) {
    return players.find(p =>
        p.aliases.find(alias =>
            alias == name.toLowerCase()
        )
    );
}
function FindPlayerFromChannel(channelName) {
    return players.find(p =>
        '#' + p.channel.toLowerCase() == channelName.toLowerCase()
    );
}
function GetChannels() {
    let channels = [];
    players.forEach(p => {
        if (p.channel) {
            channels.push(p.channel)
        }
    })
    return channels;
}
exports.GetChannels = GetChannels;
exports.FindTempusRecordPlayer = FindTempusRecordPlayer;
exports.FindPlayer = FindPlayer;
exports.FindPlayerFromChannel = FindPlayerFromChannel;