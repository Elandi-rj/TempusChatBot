const tmi = require("tmi.js");
const options = require("./options"); //Your options file
const axios = require('axios');
const ClosestsName = require('./utilities.js').ClosestsName;
const StripVersion = require('./utilities.js').StripVersion;
const UpdateMapNames = require('./utilities.js').UpdateMapNames;
const secondsToTimeFormat = require('./utilities.js').secondsToTimeFormat;
const secondsToTimeStamp = require('./utilities.js').secondsToTimeStamp
const Intended = require('./utilities.js').Intended
const Disabled = require('./utilities.js').Disabled;
const Random = require('./utilities.js').Random;
const Unknown = require('./utilities.js').Unknown;
const FindPlayer = require('./players').FindPlayer;
const FindPlayerFromChannel = require('./players').FindPlayerFromChannel;
const FindTempusRecordPlayer = require('./players').FindTempusRecordPlayer;
const client = new tmi.client(options);
client.connect();

UpdateMapNames();

client.on("chat", (channel, userstate, message, self) => {
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

        var query = `https://tempus2.xyz/api/maps/name/${map}/zones/typeindex/${zoneType}/${zoneIndex}/records/list?start=${index}&limit=1`
        console.log(query);
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
                client.say(channel, error.response.data.error);
            })
    }
    async function SearchPlayer(searchTerm) {
        var aliasPerson = FindPlayer(searchTerm);
        if (aliasPerson) {
            var query = `https://tempus2.xyz/api/players/id/${aliasPerson.id}/info`
            return await axios.get(query)
                .then(response => {
                    if (response.data) {
                        let TempusRecordPlayer = FindTempusRecordPlayer(response.data.steamid);
                        if (TempusRecordPlayer) {
                            response.data.name = TempusRecordPlayer.name;
                        }
                    }
                    return response.data;
                })
        }
        else {
            var playerQuery = `https://tempus2.xyz/api/search/playersAndMaps/${searchTerm.replace("/", '')}`;
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
        }
    }
    function SearchTimeWithPlayer(player, classResponse, map, zoneType, zoneIndex) {
        var classIndex = classResponse == 'soldier' ? 3 : 4;
        var query = `https://tempus2.xyz/api/maps/name/${map}/zones/typeindex/${zoneType}/${zoneIndex}/records/player/${player.id}/${classIndex}`;
        console.log(query);
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
                client.say(channel, error.response.data.error);
            })
    }
    function MapInfo(searchTerm) {
        var query = `https://tempus2.xyz/api/maps/name/${searchTerm}/fullOverview`
        console.log(query);
        axios.get(query)
            .then(function (response) {
                //Tempus | jump_rabbit_final3 by I is Rabbit
                //Tempus | Solly T6 | Demo T4 | 2 bonuses
                var data = response.data
                var mapName = data.map_info.name
                var author = "";
                if (data.authors[0]) {
                    author = data.authors.length > 1 ? ' by multiple authors' : ' by ' + data.authors[0].name;
                }
                var mapTiers = `Solly T${data.tier_info.soldier} | Demo T${data.tier_info.demoman}`;
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
                var intended = Intended(mapName);
                if (intended) {
                    intended = intended.toUpperCase() + " | "
                }
                client.say(channel, `${intended}${mapName}${author}, ${mapTiers}${course}${bonus}`);
            })
            .catch(function (error) {
                // handle error
                client.say(channel, error.response.data.error);
            })
    }
    function AuthorInfo(searchTerm) {
        var query = `https://tempus2.xyz/api/maps/name/${searchTerm}/fullOverview`
        console.log(query);
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
    }
    async function SearchPlayerMap(player) {
        var query = `https://tempus2.xyz/api/servers/statusList`;
        return await axios.get(query).then(response => {
            var map = '';
            var data = response.data;
            data.forEach(server => {
                if (server.game_info) {
                    var users = server.game_info.users;
                    users.find(function (person) {
                        if (person.steamid === player.steamid) {
                            map = server.game_info.currentMap;
                            return;
                        }
                    });
                }
            });
            return map;
        })
    }
    function PlayerRank(player, type) {
        var query = `https://tempus2.xyz/api/players/id/${player.id}/rank`;
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
    }
    function SearchRank(index, type) {
        if (index < 1 || isNaN(index)) { index = 1; }
        var query = `https://tempus2.xyz/api/ranks/${type}?start=${index}`;
        console.log(query);
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
    }
    function MapVideo(map, classResponse) {
        var query = `https://tempus.xyz/api/maps/name/${map}/fullOverview`
        console.log(query);
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
    function YoutubeSearch(map, classResponse) {
        var query = `https://tempus.xyz/api/maps/name/${map}/zones/typeindex/map/1/records/list?start=1&limit=1`;
        axios.get(query)
            .then(function (response) {
                var seconds = response.data.results[classResponse][0].duration;
                var steamId = response.data.results[classResponse][0].steamid;
                var name = '';
                var tempusRecordsNickName = '';
                tempusRecordsNickNameNormalised = '';
                var date = response.data.results[classResponse][0].date;
                if (FindTempusRecordPlayer(steamId)) {
                    tempusRecordsNickName = FindTempusRecordPlayer(steamId).name.replace(' ', '+');
                    tempusRecordsNickNameNormalised = FindTempusRecordPlayer(steamId).name;
                }
                else {
                    name = response.data.results[classResponse][0].name;
                }
                var time = secondsToTimeStamp(seconds);
                if (seconds < 60 && date < 1546616086.1247716) {
                    time = time.slice(3);
                }
                if (options.identity.youtubeApi && options.identity.youtubeApi != 'YoutubeApiKey') {
                    var tempusRecordsChannelId = 'UC3dQqjaLsbiqQE0QSWl1Wfg';
                    var sQuery = `https://www.googleapis.com/youtube/v3/search?key=${options.identity.youtubeApi}&channelId=${tempusRecordsChannelId}&part=snippet,id&type=video&maxResults=1&q=${tempusRecordsNickName}+on+${map}+-+${time}`;
                    console.log(sQuery)
                    axios.get(sQuery)
                        .then(function (youtubeResponse) {
                            if (youtubeResponse.data.items[0]) {
                                var link = `https://www.youtube.com/watch?v=${youtubeResponse.data.items[0].id.videoId} (${tempusRecordsNickNameNormalised}${name} on ${map} ${time})`;
                                client.say(channel, link);
                            }
                            else {
                                strippedMap = StripVersion(map);
                                var sBackupQuery = `https://www.googleapis.com/youtube/v3/search?key=${options.identity.youtubeApi}&channelId=${tempusRecordsChannelId}&part=snippet,id&type=video&maxResults=1&q=${tempusRecordsNickName}+on+${strippedMap}+-+${time}`;
                                axios.get(sBackupQuery)
                                    .then(function (backupResponse) {
                                        if (backupResponse.data.items[0]) {
                                            var link = `https://www.youtube.com/watch?v=${backupResponse.data.items[0].id.videoId} (${tempusRecordsNickNameNormalised}${name} on ${map} ${time})`;
                                            client.say(channel, link);
                                        }
                                        else {
                                            var link = `https://www.youtube.com/results?search_query=${tempusRecordsNickName}+on+${map}+-+${time} (no exact match found for ${tempusRecordsNickNameNormalised}${name} on ${map} ${time})`;
                                            client.say(channel, link);
                                        }
                                    })
                            }
                        }).catch(error => {
                            var link = `https://www.youtube.com/results?search_query=${tempusRecordsNickName}+on+${map}+-+${time}`;
                            client.say(channel, link + ' (api quota was exceeded)');
                            throw error;
                        })
                } else {
                    var link = `https://www.youtube.com/results?search_query=${tempusRecordsNickName}+on+${map}+-+${time} (${tempusRecordsNickNameNormalised}${name} on ${map} ${time})`;
                    client.say(channel, link);
                }
            });
    }
    function CourseYoutubeSearch(map) {
        var defaultLink = `https://www.youtube.com/results?search_query=${map}+course+collection`;
        if (options.identity.youtubeApi && options.identity.youtubeApi != 'YoutubeApiKey') {
            var tempusRecordsChannelId = 'UC3dQqjaLsbiqQE0QSWl1Wfg';
            var sQuery = `https://www.googleapis.com/youtube/v3/search?key=${options.identity.youtubeApi}&channelId=${tempusRecordsChannelId}&part=snippet,id&type=video&maxResults=1&q=${map}+course+collection`;
            console.log(sQuery)
            axios.get(sQuery)
                .then(function (youtubeResponse) {
                    if (youtubeResponse.data.items[0].snippet.title == `${map} course collection`) {
                        var link = `https://www.youtube.com/watch?v=${youtubeResponse.data.items[0].id.videoId} (${map} course collection)`;
                        client.say(channel, link);
                    }
                    else {
                        var link = `${defaultLink} (no exact match found for ${map})`;
                        client.say(channel, link);
                    }
                }).catch(error => {
                    client.say(channel, defaultLink + ' (api quota was exceeded)');
                    throw error;
                })
        } else {
            client.say(channel, defaultLink);
        }
    }

    if (CommandIs('!stime') || CommandIs('!dtime')) {
        var map = ClosestsName(commandMap);
        var searchTerm = message.split(' ').slice(2).join(' ');
        var index = message.split(' ')[2] - 0;
        var classResponse = CommandIs('!stime') ? 'soldier' : 'demoman';
        var person = FindPlayerFromChannel(channel).aliases[0];
        if (map == undefined && message.split(' ')[2] == undefined || !isNaN(message.split(' ')[1]) && message.split(' ')[2] == undefined) {
            person = commandMap;
            commandMap = undefined;
            index = message.split(' ')[1] - 0;
        }
        if (commandMap == undefined) {
            SearchPlayer(FindPlayerFromChannel(channel).aliases[0]).then(p =>
                SearchPlayerMap(p)
                    .then(map =>
                        PlayerOrTimeSearch(map, person, index, classResponse, 'map', 1))
            );
        }
        else {
            if (map == undefined) {
                map = ClosestsName(message.split(' ')[2]);
                searchTerm = message.split(' ')[1];
                index = message.split(' ')[1] - 0;
            }
            if (searchTerm == '') {
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
            SearchPlayer(FindPlayerFromChannel(channel).aliases[0]).then(p =>
                SearchPlayerMap(p)
                    .then(map =>
                        SearchTime(map, classResponse, index, 'map', 1))
            );
        }
        else {
            SearchTime(map, classResponse, index, 'map', 1);
        }
    }
    if (CommandIs('!sbtime') || CommandIs('!dbtime')) {
        var map = ClosestsName(commandMap);
        var index = message.split(' ')[3] - 0;
        var searchTerm = message.split(' ').slice(3).join(' ');
        var zoneIndex = message.split(' ')[2];
        var classResponse = CommandIs('!sbtime') ? 'soldier' : 'demoman';
        if (!isNaN(commandMap - 0) && message.split(' ')[3] == undefined) {
            var person = FindPlayerFromChannel(channel);
            index = message.split(' ')[2];
            zoneIndex = message.split(' ')[1];
            SearchPlayer(person.aliases[0]).then(p =>
                SearchPlayerMap(p)
                    .then(map => {
                        var searchPerson = person.aliases[0];
                        if (message.split(' ')[2] != undefined) {
                            searchPerson = message.split(' ')[2]
                            if (isNaN(zoneIndex - 0)) {
                                searchPerson = message.split(' ')[1]
                                zoneIndex = message.split(' ')[2] - 0;
                            }
                        }
                        PlayerOrTimeSearch(map, searchPerson, index, classResponse, 'bonus', zoneIndex)
                    })
            );
        }
        else {
            if (map == undefined) {
                map = ClosestsName(message.split(' ')[3]);
                searchTerm = message.split(' ')[1];
                index = message.split(' ')[1] - 0;
            }
            if (searchTerm == '') {
                searchTerm = FindPlayerFromChannel(channel).aliases[0];
            }
            PlayerOrTimeSearch(map, searchTerm, index, classResponse, 'bonus', zoneIndex)
        }

    }
    if (CommandIs('!sbwr') || CommandIs('!dbwr')) {
        var map = ClosestsName(commandMap);
        var zoneIndex = message.split(' ')[2] - 0;
        var classResponse = CommandIs('!sbwr') ? 'soldier' : 'demoman';
        if (commandMap == undefined || !isNaN(commandMap) && message.split(' ')[2] == undefined) {
            zoneIndex = message.split(' ')[1] - 0;
            SearchPlayer(FindPlayerFromChannel(channel).aliases[0]).then(p =>
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
        var map = ClosestsName(commandMap);
        var index = message.split(' ')[3] - 0;
        var searchTerm = message.split(' ').slice(3).join(' ');
        var zoneIndex = message.split(' ')[2];
        var classResponse = CommandIs('!sctime') ? 'soldier' : 'demoman';
        if (!isNaN(commandMap - 0) && message.split(' ')[3] == undefined) {
            var person = FindPlayerFromChannel(channel);
            index = message.split(' ')[2];
            zoneIndex = message.split(' ')[1];
            SearchPlayer(person.aliases[0]).then(p =>
                SearchPlayerMap(p)
                    .then(map => {
                        var searchPerson = person.aliases[0];
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
        else {
            if (map == undefined) {
                map = ClosestsName(message.split(' ')[3]);
                searchTerm = message.split(' ')[1];
                index = message.split(' ')[1] - 0;
            }
            if (searchTerm == '') {
                searchTerm = FindPlayerFromChannel(channel).aliases[0];
            }
            PlayerOrTimeSearch(map, searchTerm, index, classResponse, 'course', zoneIndex)
        }

    }
    if (CommandIs('!scwr') || CommandIs('!dcwr')) {
        var map = ClosestsName(commandMap);
        var zoneIndex = message.split(' ')[2] - 0;
        var classResponse = CommandIs('!scwr') ? 'soldier' : 'demoman';
        if (commandMap == undefined || !isNaN(commandMap) && message.split(' ')[2] == undefined) {
            zoneIndex = message.split(' ')[1] - 0;
            SearchPlayer(FindPlayerFromChannel(channel).aliases[0]).then(p =>
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
    if (CommandIs('!m') || CommandIs('!mi')) {
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
            var person = FindPlayerFromChannel(channel);
            SearchPlayer(person.aliases[0]).then(p =>
                SearchPlayerMap(p).then(map => MapInfo(map))
            );
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
            var person = FindPlayerFromChannel(channel);
            SearchPlayer(person.aliases[0]).then(p =>
                SearchPlayerMap(p).then(map => AuthorInfo(map))
            );
        }
    }
    if (CommandIs('!update') && "#" + userstate.username === channel) {
        UpdateMapNames().then(result => {
            if (result) {
                client.say(channel, 'maplist updated');
            }
            else {
                client.say(channel, 'could not update maplist');
            }
        });
    }
    if (CommandIs('!tierlist') && "#" + userstate.username === channel) {
        if (Unknown.ListMaps()) {
            let maps = Unknown.ListMaps();
            client.say(channel, maps);
        }
        else {
            client.say(channel, 'no unknown maps found');
        }
    }
    if (CommandIs('!tieradd') && "#" + userstate.username === channel) {
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
            let result = Unknown.Add(map, classType)
            if (result) {
                client.say(channel, `${map} added into ${classType}`)
            }
            else {
                client.say(channel, `${map} could not be added into ${classType}`);
            }
        }
        else {
            client.say(channel, 'no class found');
        }
    }
    if (CommandIs('!massadd') && "#" + userstate.username === channel) {
        let mapString = message.split('!massadd ')[1];
        let mapsToAdd = Unknown.MessageToMapObject(mapString);
        mapsToAdd.forEach(m => {
            classType = m["classType"];
            switch (classType) {
                case 's':
                    classType = 'soldier'
                    break;
                case 'd':
                    classType = 'demo'
                    break;
                case 'd/s':
                    classType = 'both'
                    break;
                case 's/d':
                    classType = 'both'
                    break;
                case 'b':
                    classType = 'both'
                    break;
                default:
                    break;
            }
            m["classType"] = classType;
        })
        listOfMapsAdded = 'ADDED: ';
        listOfMapsNotAdded = 'NOT ADDED: ';
        mapsToAdd.forEach(m => {
            let result = Unknown.Add(m["map"], m["classType"])
            if (result) {
                listOfMapsAdded += `${m["map"]} ${m["classType"]} | `
            }
            else {
                listOfMapsNotAdded += `${m["map"]} ${m["classType"]} | `
            }
        });
        client.say(channel, listOfMapsAdded + ' ' + listOfMapsNotAdded);
    }
    if (CommandIs('!tierremove') && "#" + userstate.username === channel) {
        let map = ClosestsName(commandMap);
        let result = Unknown.Remove(map);
        if (result) {
            client.say(channel, `${map} removed`);
        }
        else {
            client.say(channel, `${map} not found`);
        }
    }
    if (CommandIs('!tierremoveexact') && "#" + userstate.username === channel) {
        let result = Unknown.Remove(commandMap);
        if (result) {
            client.say(channel, `${commandMap} removed`);
        }
        else {
            client.say(channel, `${commandMap} not found`);
        }
    }
    if (CommandIs('!tierduplicates')) {
        if (commandMap != '') {
            if (Unknown.Duplicates(commandMap)) {
                let maps = Unknown.Duplicates(commandMap);
                client.say(channel, maps);
            }
            else {
                client.say(channel, 'no duplicate maps found');
            }
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
                searchTerm = FindPlayerFromChannel(channel).aliases[0];
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
            SearchPlayer(FindPlayerFromChannel(channel).aliases[0]).then(p =>
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
        else {
            if (map)
                MapVideo(map, classResponse)
            else {
                client.say(channel, 'Map not found');
            }
        }
    }
    if (CommandIs('!ssearch') || CommandIs('!dsearch')) {
        var classResponse = CommandIs('!ssearch') ? 'soldier' : 'demoman';
        var map = ClosestsName(commandMap);
        if (commandMap == undefined) {
            SearchPlayer(FindPlayerFromChannel(channel).aliases[0]).then(p =>
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
        else {
            if (map) {
                YoutubeSearch(map, classResponse)
            }
            else {
                client.say(channel, 'Map not found');
            }
        }
    }
    if (CommandIs('!coursecollection') || CommandIs('!cc')) {
        var map = ClosestsName(commandMap);
        if (commandMap == undefined) {
            SearchPlayer(FindPlayerFromChannel(channel).aliases[0]).then(p =>
                SearchPlayerMap(p)
                    .then(map => {
                        if (map) {
                            CourseYoutubeSearch(map)
                        }
                        else {
                            client.say(channel, 'Map not found');
                        }
                    })
            );
        }
        else {
            if (map) {
                CourseYoutubeSearch(map)
            }
            else {
                client.say(channel, 'Map not found');
            }
        }
    }
    if (CommandIs('!random')) {
        if (commandMap == undefined) {
            let map = Random.Map();
            client.say(channel, map);
        }
        else {
            switch (commandMap) {
                case 's': case 'soldier':
                    client.say(channel, Random.ClassMap("soldier"))
                    break;
                case 'd': case 'demo': case 'demoman':
                    client.say(channel, Random.ClassMap("demo"))
                    break;
                case 'b': case 'both':
                    client.say(channel, Random.ClassMap("both"))
                    break;
                default:
                    break;
            }
        }
    }
    if (CommandIs('!voteparty')) {
        client.say(channel, 'WELCOME TO THE PARTY (!leaveparty to leave)');
    }
    if (CommandIs('!leaveparty')) {
        client.say(channel, ':(');
    }
});
