players = [
    {
        aliases: ['steve', 'arvinge'],
        id: 11020,
        channel: 'arvinge',
    },
    {
        aliases: ['elandi'],
        id: 170674,
        channel: 'elandi',
    },
    {
        aliases: ['matty'],
        id: 1320,
        channel: 'au_matty',
    },
    {
        aliases: ['megawop'],
        id: 630,
    },
    {
        aliases: ['skinny'],
        id: 78463,
        channel: 'skinny_lad',
    },
    {
        aliases: ['boshy'],
        id: 39902,
        channel: 'boshytf',
    },
    {
        aliases: ['kater', 'exor'],
        id: 99892,
    },
    {
        aliases: ['newjuls'],
        id: 281915,
        channel: 'newjuls',
    },
    {
        aliases: ['fences'],
        id: 1701,
    },
    {
        aliases: ['riot'],
        id: 145,
    },
    {
        aliases: ['tripbwai', 'trip', 'bwai'],
        id: 11255,
        channel: 'tripbwai',
    },
    {
        aliases: ['kidder'],
        id: 76057,
    },
    {
        aliases: ['un gato', 'ungatoo', 'ungato', 'gato'],
        id: 82781,
    },
    {
        aliases: ['teardrop'],
        id: 3677,
        channel: 'teardrop_tf',
    },
    {
        aliases: ['kaptain'],
        id: 68414,
        channel: 'kaptain__',
    },
    {
        aliases: ['superchuck'],
        id: 344,
    },
    {
        aliases: ['vice'],
        id: 10736,
    },
    {
        aliases: ['zike'],
        id: 5164,
        channel: 'zike1017',
    },
    {
        aliases: ['soup'],
        id: 2220,
    },
    {
        aliases: ['starkie'],
        id: 72697,
    },
    {
        aliases: ['deceptive'],
        id: 196930,
    },
]
function FindPlayer(name) {
    return players.find(p =>
        p.aliases.find(alias =>
            alias == name.toLowerCase()
        )
    );
}
function FindPlayerFromChannel(channelName) {
    return players.find(p =>
        '#' + p.channel == channelName
    );
}
exports.FindPlayer = FindPlayer;
exports.FindPlayerFromChannel = FindPlayerFromChannel;