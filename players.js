players = [
    {
        aliases: ['steve', 'arvinge'],
        id: 11020,
    },
    {
        aliases: ['elandi'],
        id: 170674,
    },
    {
        aliases: ['matty'],
        id: 1320,
    },
    {
        aliases: ['megawop'],
        id: 630,
    },
    {
        aliases: ['skinny'],
        id: 78463,
    },
    {
        aliases: ['boshy'],
        id: 39902,
    },
    {
        aliases: ['kater'],
        id: 99892,
    },
    {
        aliases: ['newjuls'],
        id: 281915,
    },
    {
        aliases: ['riot'],
        id: 145,
    },
    {
        aliases: ['tripbwai', 'trip', 'bwai'],
        id: 11255,
    },
    {
        aliases: ['kidder'],
        id: 76057,
    },
    {
        aliases: ['teardrop'],
        id: 3677,
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

module.exports = function (name) {
    return players.find(p =>
        p.aliases.find(alias =>
            alias == name.toLowerCase()
        )
    );
}