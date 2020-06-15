players = [
    {
        name: 'Steve',
        steamid: 'STEAM_0:0:51817875',
        id: 11020,
        channelName: '#arvinge'
    },
    {
        name: 'Elandi',
        steamid: 'STEAM_0:0:166849573',
        id: 170674,
        channelName: '#elandi'
    },
    {
        name: 'Matty',
        steamid: 'STEAM_0:1:37469408',
        id: 1320,
        channelName: '#au_matty'
    },
    {
        name: 'Skinny',
        steamid: 'STEAM_0:0:110172267',
        id: 78463,
        channelName: '#skinny_lad'
    },
    {
        name: 'Boshy',
        steamid: 'STEAM_0:0:43167835',
        id: 39902,
        channelName: '#boshytf'
    },
]

module.exports = function (name) {
    return players.find(p => p.channelName == name);
}