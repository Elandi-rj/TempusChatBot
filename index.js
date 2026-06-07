const fs = require('fs');
const tmi = require("tmi.js");
const path = require('path');
const optionsPath = path.join(process.cwd(), "options.json");
const dbMapsPath = path.join(process.cwd(), "DBmaps.json");
const axios = require('axios');
const ClosestsName = require('./utilities.js').ClosestsName;
const FindMatchingMap = require('./utilities.js').FindMatchingMap;
const StripVersion = require('./utilities.js').StripVersion;
const UpdateMapNames = require('./utilities.js').UpdateMapNames;
const UpdateMapNamesFromDB = require('./utilities.js').UpdateMapNamesFromDB;
const secondsToTimeFormat = require('./utilities.js').secondsToTimeFormat;
const formatTime = require('./utilities.js').formatTime;
const Intended = require('./utilities.js').Intended
const Disabled = require('./utilities.js').Disabled;
const Random = require('./utilities.js').Random;
const FindPlayer = require('./players').FindPlayer;
const FindPlayerFromChannel = require('./players').FindPlayerFromChannel;
const FindTempusRecordPlayer = require('./players').FindTempusRecordPlayer;
const AddAlias = require('./players').AddAlias
const options = JSON.parse(fs.readFileSync(optionsPath, 'utf8'));
const DBmaps = JSON.parse(fs.readFileSync(dbMapsPath, 'utf8'));
const SteamApiKey = options.identity.steamApi;
const { queryGameServerPlayer, queryGameServerInfo, queryMasterServer } = require("steam-server-query");
const { channel } = require("tmi.js/lib/utils.js");

let userIdentity = [{
        "aliases": options.identity.alias,
        "id": options.identity.tempusId,
        "channel": options.identity.twitchChannel,
        "steamId64": options.identity.steamId64
    },]

AddAlias(options.identity)
options.channels = [options.identity.twitchChannel];
options.identity.username = options.identity.twitchChannel;
options.identity.youtubeSearchChannelId = "UCV34MoxMwB6CAagbisQKKmw"; //tempus archive youtube channel id
const client = new tmi.client(options);
client.connect();
client.on("chat", (channel, userstate, message, self) => {
    let endOfMessage = message.charAt(message.length - 1);
    if (!/[a-zA-Z0-9]/.test(endOfMessage)) {
        //console.log('Not a letter or number!');
        message = message.slice(0, -3)
    }
    //channel is which channel it comes from. Not very usable if you are in one channel only.
    //Userstate is an object which contains a lot of information, if the user who wrote is a subscriber, what emotes he used etc.
    //message is the message itself.
    //self is your bot. 
    if (self) return;
    if (message.split('')[0] != "!") return;
    var command = message.split(' ')[0];
    var commandMap = message.split(' ')[1];
    if (message.split(' ')[1]) {
        commandMap = commandMap.toLowerCase();
    }
    function CommandIs(msg) {
        return command.toLowerCase() === msg;
    }
    if (CommandIs('!tempusdisable') && ("#" + userstate.username === channel || userstate.mod)) {
        let result = Disabled.Add(channel);
        if (result) {
            client.say(channel, '/me is going to sleep..zzz')
        }
    }
    if (CommandIs('!tempusenable') && ("#" + userstate.username === channel || userstate.mod)) {
        let result = Disabled.Remove(channel);
        if (result) {
            client.say(channel, '/me has awoken')
        }
    }
    if (Disabled.Find(channel)) {
        return;
    }
    function SearchTime(map, classResponse, index, zoneType, zoneIndex) {
        if (index < 1 || isNaN(index)) { index = 1; }
        if (zoneIndex < 1 || isNaN(zoneIndex)) { zoneIndex = 1; }

        var query = `https://tempus2.xyz/api/v0/maps/name/${map}/zones/typeindex/${zoneType}/${zoneIndex}/records/list?start=${index}&limit=1`
        console.log(query);
        try {
            axios.get(query)
                .then(function (response) {
                    var data = response.data.results[classResponse][0];
                    if (data) {
                        let TempusRecordPlayer = FindTempusRecordPlayer(data.steamid);
                        if (TempusRecordPlayer) {
                            data.name = TempusRecordPlayer.name;
                        }
                        var time = secondsToTimeFormat(data.duration);
                        var zoneInfo = '';
                        if (zoneType != 'map') {
                            zoneInfo = ` ${zoneType} ${zoneIndex}`;
                        }
                        //Tempus | (Solly) Boshy is ranked 2/47 on jump_rabbit_final3 with time: 10:48.06
                        client.say(channel, `(${classResponse == 'soldier' ? 'Solly' : 'Demo'}) ${data.name} is ranked ${index}/${response.data.completion_info[classResponse]} on ${map}${zoneInfo} with time: ${time}`);
                    }
                    else {
                        client.say(channel, `No record found on ` + map);
                    }
                })
                .catch(function (error) {
                    // handle error
                    if (map == undefined) { map = '' }
                    client.say(channel, map + ' not found on tempus');
                })
        } catch (error) {
            client.say(channel, 'slow down there partner (tempus api on cooldown)');
        }

    }
    async function SearchPlayer(searchTerm) {
        var aliasPerson = FindPlayer(searchTerm, userIdentity);
        if (aliasPerson) {
            var query = `https://tempus2.xyz/api/v0/players/id/${aliasPerson.id}/info`
            try {
                return await axios.get(query)
                    .then(response => {
                        if (response.data) {
                            let TempusRecordPlayer = FindTempusRecordPlayer(response.data.steamid);
                            if (TempusRecordPlayer) {
                                //response.data.name = TempusRecordPlayer.name;
                            }
                        }
                        return response.data;
                    })
            } catch (error) {
                client.say(channel, 'slow down there partner (tempus api on cooldown)');
            }
        }
        else {
            var playerQuery = `https://tempus2.xyz/api/v0/search/playersAndMaps/${searchTerm.replace("/", '')}`;
            try {
                console.log(playerQuery);
                return await axios.get(playerQuery)
                    .then(p => {
                        if (p.data.players[0]) {
                            let TempusRecordPlayer = FindTempusRecordPlayer(p.data.players[0].steamid);
                            if (TempusRecordPlayer) {
                                p.data.players[0].name = TempusRecordPlayer.name;
                            }
                        }
                        return p.data.players[0];
                    })
                    .catch(error => {
                        console.log(error.response.data.error);
                        throw error;
                    });
            } catch (error) {
                client.say(channel, 'slow down there partner (tempus api on cooldown)')
            }

        }
    }
    function SearchTimeWithPlayer(player, classResponse, map, zoneType, zoneIndex) {
        var classIndex = classResponse == 'soldier' ? 3 : 4;
        var query = `https://tempus2.xyz/api/v0/maps/name/${map}/zones/typeindex/${zoneType}/${zoneIndex}/records/player/${player.id}/${classIndex}`;
        console.log(query);
        try {
            axios.get(query)
                .then(function (response) {
                    var data = response.data.result;
                    if (data) {
                        let TempusRecordPlayer = FindTempusRecordPlayer(data.steamid);
                        if (TempusRecordPlayer) {
                            data.name = TempusRecordPlayer.name;
                        }
                        var time = secondsToTimeFormat(data.duration);
                        var zoneInfo = '';
                        if (zoneType != 'map') {
                            zoneInfo = ` ${zoneType} ${zoneIndex}`;
                        }
                        client.say(channel, `(${classResponse == 'soldier' ? 'Solly' : 'Demo'}) ${data.name} is ranked ${data.rank}/${response.data.completion_info[classResponse]} on ${map}${zoneInfo} with time: ${time}`);
                    }
                    else {
                        client.say(channel, 'No record found on ' + map);
                    }
                })
                .catch(function (error) {
                    // handle error
                    if (map == undefined) { map = '' }
                    client.say(channel, map + ' not found on tempus');
                })
        } catch (error) {
            client.say(channel, 'slow down there partner (tempus api on cooldown)')
        }

    }
    function MapInfo(searchTerm) {
        var query = `https://tempus2.xyz/api/v0/maps/name/${searchTerm}/fullOverview2`
        console.log(query);
        try {
            axios.get(query)
                .then(function (response) {
                    //Tempus | jump_rabbit_final3 by I is Rabbit
                    //Tempus | Solly T6 | Demo T4 | 2 bonuses
                    var data = response.data
                    var mapName = data.map_info.name
                    var author = "";
                    var sRating = data.rating_info['soldier'];
                    var dRating = data.rating_info['demoman'];
                    if (data.authors[0]) {
                        author = data.authors.length > 1 ? ' by multiple authors' : ' by ' + data.authors[0].name;
                    }
                    var mapTiers = `Solly T${data.tier_info.soldier}/R${sRating} | Demo T${data.tier_info.demoman}/R${dRating}`;
                    var bonus = '';
                    var course = '';
                    var courseData = data.zone_counts.course;
                    var bonusData = data.zone_counts.bonus;
                    if (bonusData) {
                        bonus = bonusData > 1 ? ` | ${bonusData} bonuses` : ` | 1 bonus`;
                    }
                    if (courseData) {
                        course = courseData > 1 ? ` | ${courseData} courses` : ` | 1 course`;
                    }
                    var intended = Intended(mapName, DBmaps);
                    if (intended) {
                        intended = intended.toUpperCase() + " | "
                    }
                    client.say(channel, `${intended}${mapName}${author} | ${mapTiers}${course}${bonus}`);
                })
                .catch(function (error) {
                    // handle error
                    if (searchTerm == undefined) {
                        searchTerm = '';
                    }
                    client.say(channel, searchTerm + ' not found on tempus');
                })
        } catch (error) {
            client.say(channel, 'slow down there partner (tempus api on cooldown)')
        }

    }
    function AuthorInfo(searchTerm) {
        var query = `https://tempus2.xyz/api/v0/maps/name/${searchTerm}/fullOverview`
        console.log(query);
        try {
            axios.get(query)
                .then(function (response) {
                    var data = response.data
                    var mapName = data.map_info.name
                    var authors = '';
                    if (data.authors[0]) {
                        data.authors.forEach(author => authors += author.name + ', ');
                        client.say(channel, `${mapName} by ${authors.slice(0, -2)}`);
                    }
                    else {
                        client.say(channel, `${mapName}, no authors found`);
                    }
                })
                .catch(function (error) {
                    // handle error
                    client.say(channel, error.response.data.error);
                })
        } catch (error) {
            client.say(channel, 'slow down there partner (tempus api on cooldown)')
        }

    }
    async function SearchPlayerMap(player) {
        let listOfPromises = [];
        try {
            return await Promise.all(listOfPromises).then(serversAndPlayers => {
                var query = `https://tempus2.xyz/api/v0/servers/statusList`;
                try {
                    return axios.get(query).then(response => {
                        var map = '';
                        var data = response.data;
                        console.log(serversAndPlayers)
                        data.push(...serversAndPlayers);
                        data.forEach(server => {
                            if (server.game_info) {
                                var users = server.game_info.users;
                                users.find(function (person) {
                                    if (person.steamid === player.steamid || person.name === player.name) {
                                        map = server.game_info.currentMap;
                                        return;
                                    }
                                });
                            }
                        });
                        return map;
                    })
                } catch (error) {
                    client.say(channel, 'slow down there partner (tempus api on cooldown)')
                }
            })
        } catch (err) {
            console.error(err)
        }
    }
    async function SearchPlayerIP(steamId64) {
        try {
            var query = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${SteamApiKey}&steamids=${steamId64}`;
            console.log(query);
            return await axios.get(query).then(response => {
                var ip = response.data.response.players[0].gameserverip;
                return ip;
            })
        } catch (error) {
            throw error
        }

    }
    async function SearchSteamServerMap(IP) {
        try {
            var query = `https://api.steampowered.com/IGameServersService/GetServerList/v1/?key=${SteamApiKey}&filter=addr\\${IP}`;
            console.log(query);
            return await axios.get(query).then(response => {
                var map = '';
                if (Object.keys(response.data.response).length) {
                    map = response.data.response.servers[0].map;
                }
                return map;
            })
        } catch (error) {
            throw error
        }

    }
    function PlayerRank(player, type) {
        var query = `https://tempus2.xyz/api/v0/players/id/${player.id}/rank`;
        try {
            axios.get(query)
                .then(response => {
                    var person = response.data;
                    var rank = '';
                    var rankType = '';
                    var points = '';
                    switch (type) {
                        case 'class/3':
                            rank = person.class_rank_info['3'].rank;
                            rankType = '(Soldier)';
                            points = person.class_rank_info['3'].points;
                            break;
                        case 'class/4':
                            rank = person.class_rank_info['4'].rank;
                            rankType = '(Demoman)';
                            points = person.class_rank_info['4'].points;
                            break;
                        case 'overall':
                            rank = person.rank_info.rank;
                            rankType = '(Overall)'
                            points = person.rank_info.points;
                            break;
                        default:
                            break;
                    }
                    client.say(channel, `${rankType} ${player.name} is ranked ${rank} with ${points} points`);
                })
                .catch(error => {
                    client.say(channel, error.response.data.error);
                });
        } catch (error) {
            client.say(channel, 'slow down there partner (tempus api on cooldown)')
        }

    }
    function SearchRank(index, type) {
        if (index < 1 || isNaN(index)) { index = 1; }
        var query = `https://tempus2.xyz/api/v0/ranks/${type}?start=${index}`;
        console.log(query);
        try {
            axios.get(query)
                .then(response => {
                    person = response.data.players[0];
                    if (person) {
                        var rank = person.rank;
                        var rankType = '';
                        var points = person.points
                        switch (type) {
                            case 'class/3':
                                rankType = '(Soldier)';
                                break;
                            case 'class/4':
                                rankType = '(Demoman)';
                                break;
                            case 'overall':
                                rankType = '(Overall)'
                                break;
                            default:
                                break;
                        }
                        client.say(channel, `${rankType} ${person.name} is ranked ${rank} with ${points} points`);
                    }
                    else {
                        client.say(channel, `No person found`);
                    }
                })
                .catch(error => console.log(error));
        } catch (error) {
            client.say(channel, 'slow down there partner (tempus api on cooldown)')
        }

    }
    function MapVideo(map, classResponse) {
        var query = `https://tempus2.xyz/api/v0/maps/name/${map}/fullOverview`
        console.log(query);
        try {
            axios.get(query)
                .then(response => {
                    var url = response.data.videos[classResponse];
                    if (url) {
                        var msg = `(${classResponse == 'soldier' ? 'Solly' : 'Demo'}) ${map} https://www.youtube.com/watch?v=${url}`;
                        client.say(channel, msg);
                    }
                    else {
                        client.say(channel, 'No video found');
                    }

                })
        } catch (error) {
            client.say(channel, 'slow down there partner (tempus api on cooldown)')
        }

    }
    function PlayerOrTimeSearch(map, searchTerm, index, classResponse, zoneType, zoneIndex) {
        if (!isNaN(searchTerm - 0)) {
            SearchTime(map, classResponse, index, zoneType, zoneIndex);
        }
        else {
            SearchPlayer(searchTerm)
                .then(player => {
                    if (player) {
                        SearchTimeWithPlayer(player, classResponse, map, zoneType, zoneIndex);
                    }
                    else {
                        client.say(channel, 'No person was found')
                    }
                });
        }
    }
    function YoutubeSearch(map, classResponse, zoneIndex, zoneType) {
        var query = `https://tempus2.xyz/api/v0/maps/name/${map}/zones/typeindex/map/1/records/list?start=1&limit=1`;
        if (zoneIndex) {
            var query = `https://tempus2.xyz/api/v0/maps/name/${map}/zones/typeindex/${zoneType}/${zoneIndex}/records/list?start=1&limit=1`;
        }
        try {
            axios.get(query)
                .then(function (response) {
                    if (response.code) {
                        console.log("error");
                    }
                    var zoneString = '';
                    var ZoneStringNormalised = '';
                    if (zoneIndex) {
                        zoneString = `+${zoneType}+${zoneIndex}`
                        ZoneStringNormalised = `${zoneType} ${zoneIndex}`
                    }
                    var seconds = response.data.results[classResponse][0].duration;
                    var steamId = response.data.results[classResponse][0].steamid;
                    var name = '';
                    var tempusRecordsNickName = '';
                    var tempusRecordsNickNameNormalised = '';
                    let classLetter = classResponse.slice(0, 1).toUpperCase();
                    if (FindTempusRecordPlayer(steamId)) {
                        tempusRecordsNickName = FindTempusRecordPlayer(steamId).name.replace(' ', '+');
                        tempusRecordsNickNameNormalised = FindTempusRecordPlayer(steamId).name;
                    }
                    else {
                        name = response.data.results[classResponse][0].name;
                    }
                    var time = formatTime(seconds * 1000, 3, response.data.results[classResponse][0].date - 0);
                    if (options.identity.youtubeApi && options.identity.youtubeApi != 'YoutubeApiKey') {
                        var tempusArchiveChannelId = options.identity.youtubeSearchChannelId;
                        var sQuery = `https://www.googleapis.com/youtube/v3/search?key=${options.identity.youtubeApi}&channelId=${tempusArchiveChannelId}&part=snippet,id&type=video&maxResults=1&q=[${classLetter}]+${tempusRecordsNickName}+on+${map}${zoneString}+-+${time}`;
                        console.log(sQuery)
                        axios.get(sQuery)
                            .then(function (youtubeResponse) {
                                if (youtubeResponse.data.items[0]) { //if full exact match found
                                    let videoTitle = youtubeResponse.data.items[0].snippet.title;
                                    var link = `https://www.youtube.com/watch?v=${youtubeResponse.data.items[0].id.videoId} ${videoTitle}`;
                                    client.say(channel, link);
                                }
                                else { //else if exact match without the time
                                    let sBackupQuery = `https://www.googleapis.com/youtube/v3/search?key=${options.identity.youtubeApi}&channelId=${tempusArchiveChannelId}&part=snippet,id&type=video&maxResults=1&q=[${classLetter}]+${tempusRecordsNickName}+on+${map}${zoneString}+-`;
                                    axios.get(sBackupQuery)
                                        .then(function (backupResponse) {
                                            if (backupResponse.data.items[0]) {
                                                let videoTitle = backupResponse.data.items[0].snippet.title;
                                                var link = `https://www.youtube.com/watch?v=${backupResponse.data.items[0].id.videoId} ${videoTitle}`;
                                                client.say(channel, link);
                                            }
                                            else { //else if exact match without time and stripped version of map name
                                                strippedMap = StripVersion(map);
                                                let sBackupQueryStripped = `https://www.googleapis.com/youtube/v3/search?key=${options.identity.youtubeApi}&channelId=${tempusArchiveChannelId}&part=snippet,id&type=video&maxResults=1&q=[${classLetter}]+${tempusRecordsNickName}+on+${strippedMap}${zoneString}+-`;
                                                axios.get(sBackupQueryStripped)
                                                    .then(function (backupResponse) {
                                                        if (backupResponse.data.items[0]) {
                                                            let videoTitle = backupResponse.data.items[0].snippet.title;
                                                            var link = `https://www.youtube.com/watch?v=${backupResponse.data.items[0].id.videoId} ${videoTitle}`;
                                                            client.say(channel, link);
                                                        }
                                                        else { //else if no exact matches found at all
                                                            var link = `https://www.youtube.com/results?search_query=${encodeURIComponent(`[${classLetter}]+${tempusRecordsNickName}+on+${map}${zoneString}+-+${time}`)} (no exact match found for ${tempusRecordsNickNameNormalised}${name} on ${map} ${ZoneStringNormalised} ${time})`;
                                                            client.say(channel, link);
                                                        }
                                                    })
                                            }
                                        })
                                }
                            }).catch(error => {
                                var link = `https://www.youtube.com/results?search_query=${encodeURIComponent(`[${classLetter}]+${tempusRecordsNickName}+on+${map}${zoneString}+-+${time}`)}`;
                                client.say(channel, link + ' (api quota was exceeded)');
                                throw error;
                            })
                    } else {
                        var link = `https://www.youtube.com/results?search_query=${encodeURIComponent(`[${classLetter}] ${tempusRecordsNickName} on ${map}${zoneString} - ${time}`)} [${classLetter}] ${tempusRecordsNickName} on ${map}${zoneString} - ${time}`;
                        client.say(channel, link);
                    }
                }).catch(error => {
                    console.log(error);
                    client.say(channel, 'Not Found');
                });
        } catch (error) {
            client.say(channel, error);
        }
    }
    // ^^^ functions
    // vvv chat commands
    if (CommandIs('!stime') || CommandIs('!dtime')) {
        var map = ClosestsName(commandMap);
        var searchTerm = message.split(' ').slice(2).join(' ');
        var index = message.split(' ')[2] - 0;
        var classResponse = CommandIs('!stime') ? 'soldier' : 'demoman';
        var person = FindPlayerFromChannel(channel, userIdentity).aliases;
        if (map == undefined && message.split(' ')[2] == undefined || !isNaN(message.split(' ')[1]) && message.split(' ')[2] == undefined) {
            person = commandMap;
            commandMap = undefined;
            index = message.split(' ')[1] - 0;
        }
        if (commandMap == undefined) {
            var channelPerson = FindPlayerFromChannel(channel, userIdentity);
            if (channelPerson.steamId64) {
                SearchPlayerIP(channelPerson.steamId64).then(Ip => {
                    if (Ip) {
                        SearchSteamServerMap(Ip).then(map => {
                            if (map) {
                                if (person != '󠀀') {
                                    PlayerOrTimeSearch(map, person, index, classResponse, 'map', 1);
                                }
                                else {
                                    client.say(channel, 'Person not found');
                                }
                            }
                            else {
                                client.say(channel, 'Map not found');
                            }
                        })
                    }
                    else {
                        SearchPlayer(FindPlayerFromChannel(channel, userIdentity).aliases).then(p =>
                            SearchPlayerMap(p)
                                .then(map =>
                                    PlayerOrTimeSearch(map, person, index, classResponse, 'map', 1))
                        );
                    }
                });
            }
            else {
                SearchPlayer(FindPlayerFromChannel(channel, userIdentity).aliases).then(p =>
                    SearchPlayerMap(p)
                        .then(map =>
                            PlayerOrTimeSearch(map, person, index, classResponse, 'map', 1))
                );
            }
        }
        else {
            if (map == undefined) {
                map = ClosestsName(message.split(' ')[2]);
                searchTerm = message.split(' ')[1];
                index = message.split(' ')[1] - 0;
            }
            if (searchTerm == '' || searchTerm == '󠀀') {
                searchTerm = person;
            }
            if (!isNaN(commandMap)) {
                map = ClosestsName(message.split(' ')[2]);
                searchTerm = message.split(' ')[1] - 0;
                index = message.split(' ')[1] - 0;
            }
            PlayerOrTimeSearch(map, searchTerm, index, classResponse, 'map', 1)
        }
    }
    if (CommandIs('!swr') || CommandIs('!dwr')) {
        var map = ClosestsName(commandMap);
        var index = message.split(' ')[2] - 0;
        var classResponse = CommandIs('!swr') ? 'soldier' : 'demoman';
        if (commandMap == undefined) {
            var person = FindPlayerFromChannel(channel, userIdentity);
            if (person.steamId64) {
                SearchPlayerIP(person.steamId64).then(Ip => {
                    if (Ip) {
                        SearchSteamServerMap(Ip).then(map => {
                            if (map) {
                                SearchTime(map, classResponse, index, 'map', 1);
                            }
                            else {
                                client.say(channel, 'Map not found');
                            }
                        })
                    }
                    else {
                        SearchPlayer(FindPlayerFromChannel(channel, userIdentity).aliases).then(p =>
                            SearchPlayerMap(p)
                                .then(map =>
                                    SearchTime(map, classResponse, index, 'map', 1))
                        );
                    }
                });
            }
            else {
                SearchPlayer(FindPlayerFromChannel(channel, userIdentity).aliases).then(p =>
                    SearchPlayerMap(p)
                        .then(map =>
                            SearchTime(map, classResponse, index, 'map', 1))
                );
            }

        }
        else {
            SearchTime(map, classResponse, index, 'map', 1);
        }
    }
    if (CommandIs('!wr')) {
        var map = ClosestsName(commandMap);
        var index = message.split(' ')[2] - 0;
        let classResponse = 'soldier';
        let classIntended = Intended(map, DBmaps);
        switch (classIntended) {
            case 's':
                classResponse = 'soldier';
                break;
            case 'd':
                classResponse = 'demoman';
                break;
            case 'b':
                classResponse = 'soldier';
                break;
            default:
                break;
        }
        if (commandMap == undefined) {
            var person = FindPlayerFromChannel(channel, userIdentity);
            if (person.steamId64) {
                SearchPlayerIP(person.steamId64).then(Ip => {
                    if (Ip) {
                        SearchSteamServerMap(Ip).then(map => {
                            if (map) {
                                SearchTime(map, classResponse, index, 'map', 1);
                            }
                            else {
                                client.say(channel, 'Map not found');
                            }
                        })
                    }
                    else {
                        SearchPlayer(FindPlayerFromChannel(channel, userIdentity).aliases).then(p =>
                            SearchPlayerMap(p)
                                .then(map =>
                                    SearchTime(map, classResponse, index, 'map', 1))
                        );
                    }
                });
            }
            else {
                SearchPlayer(FindPlayerFromChannel(channel, userIdentity).aliases).then(p =>
                    SearchPlayerMap(p)
                        .then(map =>
                            SearchTime(map, classResponse, index, 'map', 1))
                );
            }

        }
        else {
            SearchTime(map, classResponse, index, 'map', 1);
        }
    }
    if (CommandIs('!sbtime') || CommandIs('!dbtime')) {
        if (!commandMap) {
            client.say(channel, 'no zone index found');
            return
        };
        var map = ClosestsName(commandMap);
        var index = message.split(' ')[3] - 0;
        var searchTerm = message.split(' ').slice(3).join(' ');
        var zoneIndex = message.split(' ')[2];
        var classResponse = CommandIs('!sbtime') ? 'soldier' : 'demoman';
        //number index on current map search (no map inputed)
        if (!isNaN(+commandMap) && message.split(' ')[3] == undefined) {
            var person = FindPlayerFromChannel(channel, userIdentity);
            index = message.split(' ')[2];
            zoneIndex = message.split(' ')[1];
            SearchPlayer(person.aliases).then(p =>
                SearchPlayerMap(p)
                    .then(map => {
                        var searchPerson = person.aliases;
                        if (message.split(' ')[2] != undefined) {
                            searchPerson = message.split(' ')[2]
                            if (isNaN(+zoneIndex)) {
                                searchPerson = message.split(' ')[1]
                                zoneIndex = message.split(' ')[2] - 0;
                            }
                        }
                        PlayerOrTimeSearch(map, searchPerson, index, classResponse, 'bonus', zoneIndex)
                    })
            );
        }
        else { //map search first (search player for current map)
            if (zoneIndex && !isNaN(-zoneIndex)) {
                if (map == undefined) {
                    map = ClosestsName(message.split(' ')[3]);
                    searchTerm = message.split(' ')[1];
                    index = message.split(' ')[1] - 0;
                }
                if (searchTerm == '') {
                    searchTerm = FindPlayerFromChannel(channel, userIdentity).aliases;
                }
                PlayerOrTimeSearch(map, searchTerm, index, classResponse, 'bonus', zoneIndex)
            }
            else {
                client.say(channel, 'no zone index found');
            }

        }

    }
    if (CommandIs('!swrb') || CommandIs('!dwrb')) {
        var map = ClosestsName(commandMap);
        var zoneIndex = message.split(' ')[2] - 0;
        var classResponse = CommandIs('!swrb') ? 'soldier' : 'demoman';
        if (commandMap == undefined || !isNaN(commandMap) && message.split(' ')[2] == undefined) {
            zoneIndex = message.split(' ')[1] - 0;
            SearchPlayer(FindPlayerFromChannel(channel, userIdentity).aliases).then(p =>
                SearchPlayerMap(p)
                    .then(map =>
                        SearchTime(map, classResponse, 1, 'bonus', zoneIndex))
            );
        }
        else {
            SearchTime(map, classResponse, 1, 'bonus', zoneIndex);
        }
    }
    if (CommandIs('!sctime') || CommandIs('!dctime')) {
        if (!commandMap) {
            client.say(channel, 'no zone index found');
            return
        };
        var map = ClosestsName(commandMap);
        var index = message.split(' ')[3] - 0;
        var searchTerm = message.split(' ').slice(3).join(' ');
        var zoneIndex = message.split(' ')[2];
        var classResponse = CommandIs('!sctime') ? 'soldier' : 'demoman';
        //number index on current map search (no map inputed)
        if (!isNaN(+commandMap) && message.split(' ')[3] == undefined) {
            var person = FindPlayerFromChannel(channel, userIdentity);
            index = message.split(' ')[2];
            zoneIndex = message.split(' ')[1];
            SearchPlayer(person.aliases).then(p =>
                SearchPlayerMap(p)
                    .then(map => {
                        var searchPerson = person.aliases;
                        if (message.split(' ')[2] != undefined) {
                            searchPerson = message.split(' ')[2]
                            if (isNaN(zoneIndex - 0)) {
                                searchPerson = message.split(' ')[1]
                                zoneIndex = message.split(' ')[2] - 0;
                            }
                        }
                        PlayerOrTimeSearch(map, searchPerson, index, classResponse, 'course', zoneIndex)
                    })
            );
        }
        else { //map search first (search player for current map)
            if (zoneIndex && !isNaN(-zoneIndex)) {
                if (map == undefined) {
                    map = ClosestsName(message.split(' ')[3]);
                    searchTerm = message.split(' ')[1];
                    index = message.split(' ')[1] - 0;
                }
                if (searchTerm == '') {
                    searchTerm = FindPlayerFromChannel(channel, userIdentity).aliases;
                }
                PlayerOrTimeSearch(map, searchTerm, index, classResponse, 'course', zoneIndex)
            }
            else {
                client.say(channel, 'no zone index found');
            }
        }

    }
    if (CommandIs('!swrc') || CommandIs('!dwrc')) {
        var map = ClosestsName(commandMap);
        var zoneIndex = message.split(' ')[2] - 0;
        if (!isNaN(commandMap)) {
            map = ClosestsName(message.split(' ')[2]);
            zoneIndex = commandMap;
        }
        var classResponse = CommandIs('!swrc') ? 'soldier' : 'demoman';
        if (commandMap == undefined || !isNaN(commandMap) && message.split(' ')[2] == undefined) {
            zoneIndex = message.split(' ')[1] - 0;
            SearchPlayer(FindPlayerFromChannel(channel, userIdentity).aliases).then(p =>
                SearchPlayerMap(p)
                    .then(map =>
                        SearchTime(map, classResponse, 1, 'course', zoneIndex))
            );
        }
        else {
            SearchTime(map, classResponse, 1, 'course', zoneIndex);
        }
    }
    if (CommandIs('!tempuscommands')) {
        client.say(channel, 'https://github.com/Elandi-rj/TempusChatBot/blob/master/README.md');
    }
    if (CommandIs('!m') || CommandIs('!mi') || CommandIs('!map')) {
        if (commandMap) {
            if (commandMap === 'p' || commandMap === 'jump_p') { //stop naming your maps with letters ;/
                client.say(channel, 's, jump_p by bshear, Solly T5 | Demo T5 | 1 bonus');
            }
            else {
                var map = ClosestsName(commandMap);
                if (map) {
                    MapInfo(map);
                }
                else {
                    client.say(channel, 'Map not found');
                }
            }
        }
        else {
            var person = FindPlayerFromChannel(channel, userIdentity);
            if (false) { //temp disable if (person.steamId64)
                SearchPlayerIP(person.steamId64).then(Ip => {
                    console.log(Ip);
                    if (Ip) {
                        SearchSteamServerMap(Ip).then(map => {
                            if (map) {
                                MapInfo(map);
                            }
                            else {
                                client.say(channel, 'Map not found');
                            }
                        })
                    }
                    else {
                        SearchPlayer(person.aliases).then(p =>
                            SearchPlayerMap(p).then(map => MapInfo(map))
                        );
                    }
                });
            }
            else {
                SearchPlayer(person.aliases).then(p =>
                    SearchPlayerMap(p).then(map => MapInfo(map))
                );
            }

        }
    }
    if (CommandIs('!authors')) {
        if (commandMap) {
            if (commandMap === 'p' || commandMap === 'jump_p') { //stop naming your maps with letters ;/
                client.say(channel, 'jump_p by bshear');
            }
            else {
                var map = ClosestsName(commandMap);
                if (map) {
                    AuthorInfo(map);
                }
                else {
                    client.say(channel, 'Map not found');
                }
            }
        }
        else {
            var person = FindPlayerFromChannel(channel, userIdentity);
            SearchPlayer(person.aliases)
                .then(p => {
                    if (!p) return null;
                    return SearchPlayerMap(p);
                })
                .then(map => {
                    if (!map) return;
                    AuthorInfo(map);
                });
        }
    }
    if (CommandIs('!update') && "#" + userstate.username === channel) {
        UpdateMapNames(DBmaps).then(result => {
            if (result) {
                client.say(channel, 'maplist updated');
            }
            else {
                client.say(channel, 'could not update maplist');
            }
        });
    }
    if (CommandIs('!updatedb') && "#" + userstate.username === channel) {
        UpdateMapNamesFromDB(DBmaps)
        client.say(channel, "updated from database");
    }

    if (CommandIs('!tierlist') && "#" + userstate.username === channel) {
        let mapsWithoutClass = DBmaps
            .filter(item => item.class === "")
            .map(item => ' ' + item.name);
        if (mapsWithoutClass.length === 0) {
            client.say(channel, 'no uknown maps found');
        } else {
            client.say(channel, mapsWithoutClass.toString());
        }
    }
    if (CommandIs('!tieradd')) {
        let map = ClosestsName(commandMap);
        let classType = message.split(' ')[2];
        if (message.split(' ')[2]) {
            classType = classType.toLowerCase();
        }
        switch (classType) {
            case 's':
                classType = 'soldier'
                break;
            case 'd':
                classType = 'demo'
                break;
            case 'b':
                classType = 'both'
                break;
            default:
                break;
        }
        if (classType == 'soldier' || classType == 'demo' || classType == 'both') {
            const mapObj = DBmaps.find(m => m.name === map);

            if (mapObj) {
                mapObj.class = classType; // Update class
                fs.writeFileSync('DBmaps.json', JSON.stringify(DBmaps, null, 2));
                client.say(channel, `Updated ${map} to class "${classType}".`);
            } else {
                client.say(channel, `Map "${map}" not found.`);
            }
        } else {
            client.say(channel, `Invalid class type. Use "s" (soldier), "d" (demo), or "b" (both).`);
        }
    }
    if (CommandIs('!playing')) {
        var searchTerm = message.split(' ').slice(1).join(' ');
        SearchPlayer(searchTerm).then(player => {
            if (player) {
                SearchPlayerMap(player).then(map => MapInfo(map));
            }
            else {
                client.say(channel, 'No person was found');
            }
        })
    }
    if (CommandIs('!srank') || CommandIs('!drank') || CommandIs('!rank')) {
        var searchTerm = message.split(' ').slice(1).join(' ');
        var index = message.split(' ')[1];
        var type = 'overall';
        if (!CommandIs('!rank')) {
            type = CommandIs('!srank') ? 'class/3' : 'class/4';
        }
        if (!isNaN(searchTerm - 0) && index != undefined) {
            SearchRank(index, type);
        }
        else {
            if (index == undefined) {
                searchTerm = FindPlayerFromChannel(channel, userIdentity).aliases;
            }
            SearchPlayer(searchTerm)
                .then(player => {
                    if (player) {
                        PlayerRank(player, type);
                    }
                    else {
                        client.say(channel, 'No person was found')
                    }
                });
        }
    }
    if (CommandIs('!svid') || CommandIs('!dvid')) {
        var map = ClosestsName(commandMap);
        var classResponse = CommandIs('!svid') ? 'soldier' : 'demoman';
        if (commandMap == undefined) {
            var person = FindPlayerFromChannel(channel, userIdentity);
            if (person.steamId64) {
                SearchPlayerIP(person.steamId64).then(Ip => {
                    if (Ip) {
                        SearchSteamServerMap(Ip).then(serverMap => {
                            if (serverMap) {
                                var steamMap = FindMatchingMap(serverMap);
                                if (steamMap != undefined) {
                                    MapVideo(steamMap, classResponse)
                                }
                                else {
                                    if (serverMap == undefined) {
                                        serverMap == "";
                                    }
                                    client.say(channel, serverMap + ' not found on tempus');
                                }
                            } else {
                                client.say(channel, 'Map not found');
                            }
                        })
                    }
                    else {
                        SearchPlayer(FindPlayerFromChannel(channel, userIdentity).aliases).then(p =>
                            SearchPlayerMap(p)
                                .then(map => {
                                    if (map) {
                                        MapVideo(map, classResponse)
                                    }
                                    else {
                                        client.say(channel, 'Map not found');
                                    }
                                })
                        );
                    }
                });
            } else {
                SearchPlayer(FindPlayerFromChannel(channel, userIdentity).aliases).then(p =>
                    SearchPlayerMap(p)
                        .then(map => {
                            if (map) {
                                MapVideo(map, classResponse)
                            }
                            else {
                                client.say(channel, 'Map not found');
                            }
                        })
                );
            }
        }
        else {
            if (map)
                MapVideo(map, classResponse)
            else {
                client.say(channel, 'Map not found');
            }
        }
    }
    if (CommandIs('!ssearch') || CommandIs('!dsearch') || CommandIs('!swrvid') || CommandIs('!dwrvid')) {
        if (CommandIs('!ssearch')) { classResponse = 'soldier' }
        if (CommandIs('!dsearch')) { classResponse = 'demoman' }
        if (CommandIs('!swrvid')) { classResponse = 'soldier' }
        if (CommandIs('!dwrvid')) { classResponse = 'demoman' }
        var map = ClosestsName(commandMap);
        if (commandMap == undefined) {
            var person = FindPlayerFromChannel(channel, userIdentity);
            if (person.steamId64) {
                SearchPlayerIP(person.steamId64).then(Ip => {
                    if (Ip) {
                        SearchSteamServerMap(Ip).then(serverMap => {
                            if (serverMap) {
                                var steamMap = FindMatchingMap(serverMap);
                                if (steamMap != undefined) {
                                    YoutubeSearch(steamMap, classResponse)
                                }
                                else {
                                    if (serverMap == undefined) { serverMap = '' }
                                    client.say(channel, serverMap + ' not found on tempus');
                                }
                            }
                            else {
                                client.say(channel, 'Map not found');
                            }
                        })
                    }
                    else {
                        SearchPlayer(FindPlayerFromChannel(channel, userIdentity).aliases).then(p =>
                            SearchPlayerMap(p)
                                .then(map => {
                                    if (map) {
                                        YoutubeSearch(map, classResponse)
                                    }
                                    else {
                                        client.say(channel, 'Map not found');
                                    }
                                })
                        );
                    }
                });
            } else {
                SearchPlayer(FindPlayerFromChannel(channel, userIdentity).aliases).then(p =>
                    SearchPlayerMap(p)
                        .then(map => {
                            if (map) {
                                YoutubeSearch(map, classResponse)
                            }
                            else {
                                client.say(channel, 'Map not found');
                            }
                        })
                );
            }

        }
        else {
            if (map) {
                YoutubeSearch(map, classResponse)
            }
            else {
                client.say(channel, 'Map not found');
            }
        }
    }

    if (CommandIs('!swrcvid') || CommandIs('!dwrcvid')) {
        var classResponse = CommandIs('!swrcvid') ? 'soldier' : 'demoman';
        searchCourseOrBonusOrTrickWrVid(classResponse, "course");
    }

    if (CommandIs('!swrbvid') || CommandIs('!dwrbvid')) {
        var classResponse = CommandIs('!swrbvid') ? 'soldier' : 'demoman';
        searchCourseOrBonusOrTrickWrVid(classResponse, "bonus");
    }

    if (CommandIs('!swrtvid') || CommandIs('!dwrtvid')) {
        var classResponse = CommandIs('!swrtvid') ? 'soldier' : 'demoman';
        searchCourseOrBonusOrTrickWrVid(classResponse, "trick");
    }

    function searchCourseOrBonusOrTrickWrVid(classResponse, zoneType) {
        var courseIndex = '';
        if (message.split(' ')[2] - 0) { //if 2nd command is a number
            courseIndex = message.split(' ')[2];
        }
        if (message.split(' ')[1] - 0 && !isNaN(commandMap)) { //if 1st command is a number and 2nd isn't
            courseIndex = message.split(' ')[1];
            commandMap = message.split(' ')[2];
        }
        var map = ClosestsName(commandMap);
        if (commandMap == undefined && !isNaN(courseIndex)) { //if no map defined and first command is a number
            var person = FindPlayerFromChannel(channel, userIdentity);
            if (person.steamId64) {
                SearchPlayerIP(person.steamId64).then(Ip => {
                    if (Ip) {
                        SearchSteamServerMap(Ip).then(serverMap => {
                            if (serverMap) {
                                var steamMap = FindMatchingMap(serverMap);
                                if (steamMap != undefined) {
                                    YoutubeSearch(steamMap, classResponse, courseIndex, zoneType);
                                }
                                else {
                                    if (serverMap == undefined) { serverMap = ''; }
                                    client.say(channel, serverMap + ' not found on tempus');
                                }
                            }
                            else {
                                client.say(channel, 'Map not found');
                            }
                        });
                    }
                    else {
                        SearchPlayer(FindPlayerFromChannel(channel, userIdentity).aliases).then(p => SearchPlayerMap(p)
                            .then(map => {
                                if (map) {
                                    YoutubeSearch(map, classResponse, courseIndex, zoneType);
                                }
                                else {
                                    client.say(channel, 'Map not found');
                                }
                            })
                        );
                    }
                });
            } else {
                SearchPlayer(FindPlayerFromChannel(channel, userIdentity).aliases).then(p => SearchPlayerMap(p)
                    .then(map => {
                        if (map) {
                            YoutubeSearch(map, classResponse, courseIndex, zoneType);
                        }
                        else {
                            client.say(channel, 'Map not found');
                        }
                    })
                );
            }
        }
        else {
            if (map) {
                if (courseIndex) {
                    YoutubeSearch(map, classResponse, courseIndex, zoneType);
                }
                else {
                    client.say(channel, 'no course found');
                }
            }
            else {
                client.say(channel, 'Map not found');
            }
        }
        return { person, map };
    }


    if (CommandIs('!random')) {
        if (commandMap == undefined) {
            let map = Random.Map(DBmaps);
            client.say(channel, map);
        }
        else {
            let timeQuery = message.split(' ')[2]
            var person = FindPlayerFromChannel(channel, userIdentity).aliases;
            switch (commandMap) {
                case 's': case 'soldier':
                    var randomMap = Random.ClassMap("soldier", DBmaps);
                    if (timeQuery == 'time') {
                        PlayerOrTimeSearch(randomMap, person, 0, 'soldier', 'map', 1);
                        break;
                    }
                    else {
                        MapInfo(randomMap);
                        break;
                    }
                case 'd': case 'demo': case 'demoman':
                    var randomMap = Random.ClassMap("demo", DBmaps);
                    if (timeQuery == 'time') {
                        PlayerOrTimeSearch(randomMap, person, 0, 'demoman', 'map', 1);
                        break;
                    }
                    else {
                        MapInfo(randomMap);
                        break;
                    }
                case 'b': case 'both':
                    client.say(channel, Random.ClassMap("both", DBmaps))
                    break;
                default:
                    break;
            }
        }
    }
    if (CommandIs('!winner')) {
        client.say(channel, 'Congratulations!');
    }
    if (CommandIs('!voteparty')) {
        client.say(channel, 'WELCOME TO THE PARTY (!leaveparty to leave)');
    }
    if (CommandIs('!leaveparty')) {
        client.say(channel, ':(');
    }
});


