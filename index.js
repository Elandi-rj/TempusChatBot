const tmi = require("tmi.js");
const options = require("./options"); //Your options file
const axios = require('axios');
const ClosestsName = require('./utilities.js').ClosestsName;
const StripVersion = require('./utilities.js').StripVersion;
const UpdateMapNames = require('./utilities.js').UpdateMapNames;
const secondsToTimeFormat = require('./utilities.js').secondsToTimeFormat;
const secondsToTimeStamp = require('./utilities.js').secondsToTimeStamp
const FindPlayer = require('./players').FindPlayer;
const FindPlayerFromChannel = require('./players').FindPlayerFromChannel;
const FindTempusRecordPlayer = require('./players').FindTempusRecordPlayer;
const client = new tmi.client(options);
client.connect();

client.on("chat", (channel, userstate, message, self) => {
    //channel is which channel it comes from. Not very usable if you are in one channel only.
    //Userstate is an object which contains a lot of information, if the user who wrote is a subscriber, what emotes he used etc.
    //message is the message itself.
    //self is your bot. 
    if (self) return;

    var command = message.split(' ')[0];
    var commandMap = message.split(' ')[1];
    if (message.split(' ')[1]) {
        commandMap = commandMap.toLowerCase();
    }


    function CommandIs(msg) {
        return command.toLowerCase() === msg;
    }
    function SearchTime(map, classResponse, index, zoneType, zoneIndex) {
        if (index < 1 || isNaN(index)) { index = 1; }
        if (zoneIndex < 1 || isNaN(zoneIndex)) { zoneIndex = 1; }

        var query = `https://tempus.xyz/api/maps/name/${map}/zones/typeindex/${zoneType}/${zoneIndex}/records/list?start=${index}&limit=1`
        console.log(query);
        axios.get(query)
            .then(function (response) {
                var data = response.data.results[classResponse][0];
                if (data) {
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
            var query = `https://tempus.xyz/api/players/id/${aliasPerson.id}/info`
            return await axios.get(query)
                .then(response => {
                    return response.data;
                })
        }
        else {
            var playerQuery = `https://tempus.xyz/api/search/playersAndMaps/${searchTerm.replace("/", '')}`;
            console.log(playerQuery);
            return await axios.get(playerQuery)
                .then(p => {
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
        var query = `https://tempus.xyz/api/maps/name/${map}/zones/typeindex/${zoneType}/${zoneIndex}/records/player/${player.id}/${classIndex}`;
        console.log(query);
        axios.get(query)
            .then(function (response) {
                var data = response.data.result;
                if (data) {
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
        var query = `https://tempus.xyz/api/maps/name/${searchTerm}/fullOverview`
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
                client.say(channel, `${mapName}${author}, ${mapTiers}${course}${bonus}`);
            })
            .catch(function (error) {
                // handle error
                client.say(channel, error.response.data.error);
            })
    }
    function AuthorInfo(searchTerm) {
        var query = `https://tempus.xyz/api/maps/name/${searchTerm}/fullOverview`
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
        var query = `https://tempus.xyz/api/servers/statusList`;
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
        var query = `https://tempus.xyz/api/players/id/${player.id}/rank`;
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
        var query = `https://tempus.xyz/api/ranks/${type}?start=${index}`;
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
                var date = response.data.results[classResponse][0].date;
                if (FindTempusRecordPlayer(steamId)) {
                    tempusRecordsNickName = FindTempusRecordPlayer(steamId).name.replace(' ', '+');
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
                                var link = `https://www.youtube.com/watch?v=${youtubeResponse.data.items[0].id.videoId} (${tempusRecordsNickName}${name} ${time})`;
                                client.say(channel, link);
                            }
                            else {
                                map = StripVersion(map);
                                axios.get(sQuery)
                                    .then(function (backupResponse) {
                                        if (backupResponse.data.items[0]) {
                                            var link = `https://www.youtube.com/watch?v=${backupResponse.data.items[0].id.videoId} (${tempusRecordsNickName}${name} ${time})`;
                                            client.say(channel, link);
                                        }
                                        else {
                                            var link = `https://www.youtube.com/results?search_query=${tempusRecordsNickName}+on+${map}+-+${time} (no exact match found for ${tempusRecordsNickName}${name} ${time})`;
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
                    var link = `https://www.youtube.com/results?search_query=${tempusRecordsNickName}+on+${map}+-+${time} (${tempusRecordsNickName}${name} ${time})`;
                    client.say(channel, link);
                }
            });
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
                client.say(channel, 'jump_p by bshear, Solly T5 | Demo T5 | 1 bonus');
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
    if (CommandIs('!update') && userstate.badges.broadcaster) {
        UpdateMapNames();
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
    if (CommandIs('!voteparty')) {
        client.say(channel, 'WELCOME TO THE PARTY (!leaveparty to leave)');
    }
    if (CommandIs('!leaveparty')) {
        client.say(channel, ':(');
    }
});