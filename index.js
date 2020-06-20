const tmi = require("tmi.js");
const options = require("./options"); //Your options file
const axios = require('axios');
const ClosestsName = require('./utilities.js').ClosestsName;
const UpdateMapNames = require('./utilities.js').UpdateMapNames;
const secondsToTimeFormat = require('./utilities.js').secondsToTimeFormat;
const findPlayer = require('./players');

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
    function CommandIs(msg) {
        return command === msg;
    }
    function SearchTime(map, classResponse, command, index, zoneType, zoneIndex) {
        if (index < 1 || isNaN(index)) { index = 1; }
        if (zoneIndex < 1 || isNaN(zoneIndex)) { zoneIndex = 1; }

        var query = `https://tempus.xyz/api/maps/name/${map}/zones/typeindex/${zoneType}/${zoneIndex}/records/list?start=${index}&limit=1`
        console.log(query);
        axios.get(query)
            .then(function (response) {
                var data = response.data.results[classResponse][0]
                if (data) {
                    var time = secondsToTimeFormat(data.duration);
                    var zoneInfo = '';
                    if (zoneType != 'map') {
                        zoneInfo = ` ${zoneType} ${zoneIndex}`;
                    }
                    //Tempus | (Solly) Boshy is ranked 2/47 on jump_rabbit_final3 with time: 10:48.06
                    client.say(channel, `(${classResponse == 'soldier' ? 'Solly' : 'Demo'}) ${data.name} is ranked ${index} on ${map}${zoneInfo} with time: ${time}`);
                }
                else {
                    client.say(channel, `No time was found`);
                }
            })
            .catch(function (error) {
                // handle error
                client.say(channel, error.response.data.error);
            })
    }
    function SearchPlayerAndTime(map, searchTerm, classResponse, zoneType, zoneIndex) {
        var playerQuery = `https://tempus.xyz/api/search/playersAndMaps/${searchTerm}`;
        console.log(playerQuery);
        axios.get(playerQuery)
            .then(function (response) {
                var player = response.data.players[0];
                if (player) {
                    SearchTimeWithPlayer(player, classResponse, map, zoneType, zoneIndex)
                }
                else {
                    client.say(channel, `No person was found`);
                }
            })
            .catch(function (error) {
                client.say(channel, error.response.data.error);
            })
    }
    function SearchTimeWithPlayer(player, classResponse, map, zoneType, zoneIndex) {
        var query = `https://tempus.xyz/api/maps/name/${map}/zones/typeindex/${zoneType}/${zoneIndex}/records/list?limit=0`
        console.log(query);

        axios.get(query)
            .then(function (response) {
                var rankIndex = 0;
                var timesLength = 0;
                var data = response.data.results[classResponse].find(function (element, index, array) {
                    if (element.player_info.id == player.id) {
                        rankIndex = index + 1;
                        timesLength = array.length;
                        return element;
                    }
                });
                if (data) {
                    var time = secondsToTimeFormat(data.duration);
                    var zoneInfo = '';
                    if (zoneType != 'map') {
                        zoneInfo = ` ${zoneType} ${zoneIndex}`;
                    }
                    client.say(channel, `(${classResponse == 'soldier' ? 'Solly' : 'Demo'}) ${data.name} is ranked ${rankIndex}/${timesLength} on ${map}${zoneInfo} with time: ${time}`);
                }
                else {
                    client.say(channel, 'No time found');
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
                var author = data.authors.length > 1 ? 'multiple authors' : data.authors[0].name;
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
                client.say(channel, `${mapName} by ${author}, ${mapTiers}${course}${bonus}`);
            })
            .catch(function (error) {
                // handle error
                client.say(channel, error.response.data.error);
            })
    }
    //todo add player.js feature back
    // add !playerinfo function for ranks and such
    // !srank 20
    // add course wr and times too
    // !demo maybe
    // add !svid
    // maybe add !recent https://tempus.xyz/api/activity
    // !voteparty

    function PlayerOrTimeSearch(command, map, searchTerm, index, classResponse, zoneType, zoneIndex) {
        if (!isNaN(searchTerm - 0)) {
            SearchTime(map, classResponse, command, index, zoneType, zoneIndex);
        }
        else {
            SearchPlayerAndTime(map, searchTerm, classResponse, zoneType, zoneIndex);
        }
    }

    if (CommandIs('!stime') || CommandIs('!dtime')) {
        var map = ClosestsName(commandMap);
        var searchTerm = message.split(' ').slice(2).join(' ');
        var index = message.split(' ')[2] - 0;
        var classResponse = CommandIs('!stime') ? 'soldier' : 'demoman';
        PlayerOrTimeSearch(command, map, searchTerm, index, classResponse, 'map', 1)
    }
    if (CommandIs('!swr') || CommandIs('!dwr')) {
        var map = ClosestsName(commandMap);
        var index = message.split(' ')[2] - 0;
        var classResponse = CommandIs('!swr') ? 'soldier' : 'demoman';
        SearchTime(map, classResponse, command, index, 'map', 1);
    }
    if (CommandIs('!sbtime') || CommandIs('!dbtime')) {
        var map = ClosestsName(commandMap);
        var index = message.split(' ')[3] - 0;
        var searchTerm = message.split(' ').slice(3).join(' ');
        var zoneIndex = message.split(' ')[2];
        var classResponse = CommandIs('!sbtime') ? 'soldier' : 'demoman';
        PlayerOrTimeSearch(command, map, searchTerm, index, classResponse, 'bonus', zoneIndex)
    }
    if (CommandIs('!sbwr') || CommandIs('!dbwr')) {
        var map = ClosestsName(commandMap);
        var zoneIndex = message.split(' ')[2] - 0;
        var classResponse = CommandIs('!sbwr') ? 'soldier' : 'demoman';
        SearchTime(map, classResponse, command, 1, 'bonus', zoneIndex)
    }
    if (CommandIs('!sctime') || CommandIs('!dctime')) {
        var map = ClosestsName(commandMap);
        var index = message.split(' ')[3] - 0;
        var searchTerm = message.split(' ').slice(3).join(' ');
        var zoneIndex = message.split(' ')[2];
        var classResponse = CommandIs('!sctime') ? 'soldier' : 'demoman';
        PlayerOrTimeSearch(command, map, searchTerm, index, classResponse, 'course', zoneIndex)
    }
    if (CommandIs('!scwr') || CommandIs('!dcwr')) {
        var map = ClosestsName(commandMap);
        var zoneIndex = message.split(' ')[2] - 0;
        var classResponse = CommandIs('!scwr') ? 'soldier' : 'demoman';
        SearchTime(map, classResponse, command, 1, 'course', zoneIndex)
    }
    if (CommandIs('!tempuscommands')) {
        client.say(channel, 'https://github.com/Elandi-rj/TempusChatBot/blob/master/README.md');
    }
    if (CommandIs('!m') || CommandIs('!mi')) {
        if (commandMap === 'p' || commandMap === 'jump_p') { //stop naming your maps with letters ;/
            client.say(channel, 'jump_p by bshear, Solly T5 | Demo T5 | 1 bonus');
        }
        else {
            var map = ClosestsName(commandMap);
            if (map) {
                MapInfo(map);
            }
            else {
                client.say(channel, 'Map not found.');
            }
        }

    }
    if (CommandIs('!update') && userstate['user-id'] == 104466319) {
        UpdateMapNames();
    }
    //https://tempus.xyz/api/players/id/170674/rank
});