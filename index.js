const tmi = require("tmi.js");
const options = require("./options"); //Your options file
const axios = require('axios');
const ClosestsName = require('./MapFunctions.js').ClosestsName;
const UpdateMapNames = require('./MapFunctions.js').UpdateMapNames;
const findPlayer = require('./players');
//Connect to twitch server
const client = new tmi.client(options);
client.connect();

//on chat
client.on("chat", (channel, userstate, message, self) => {
    //channel is which channel it comes from. Not very usable if you are in one channel only.
    //Userstate is an object which contains a lot of information, if the user who wrote is a subscriber, what emotes he used etc.
    //message is the message itself.
    //self is your bot. 
    function inMessage(msg) {
        return message.toLowerCase().includes(msg);
    }
    function secondsToTimeFormat(time) {
        // Hours, minutes and seconds
        var hrs = ~~(time / 3600);
        var mins = ~~((time % 3600) / 60);
        var secs = (time % 60).toFixed(2);

        // Output like "1:01" or "4:03:59" or "123:03:59"
        var ret = "";

        if (hrs > 0) {
            ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }

        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;
        return ret;
    }
    function MapTime(map, classResponse, command, index) {
        if (command === '!swr' || command === '!dwr') { index = 1; }
        if (index < 1 || isNaN(index)) { index = 1; }
        if (command === '!dwr' || command === '!swr') { index = 1; }

        //var query = `https://tempus.xyz/api/maps/name/${map}/zones/typeindex/map/1/records/list?limit=${index}`
        var query = `https://tempus.xyz/api/maps/name/${map}/zones/typeindex/map/1/records/list?start=${index}&limit=1`
        console.log(query);
        axios.get(query)
            .then(function (response) {
                var data = response.data.results[classResponse][0]
                if (data) {
                    var time = secondsToTimeFormat(data.duration);
                    //Tempus | (Solly) Boshy is ranked 2/47 on jump_rabbit_final3 with time: 10:48.06
                    client.say(channel, `(${classResponse == 'soldier' ? 'Solly' : 'Demo'}) ${data.name} is ranked ${data.rank} on ${map} with time: ${time}`);
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
    function SearchPlayerAndTime(map, searchTerm, classResponse) {
        var personQuery = `https://tempus.xyz/api/search/playersAndMaps/${searchTerm}`;
        console.log(personQuery);
        axios.get(personQuery)
            .then(function (response) {
                var person = response.data.players[0];
                if (person) {
                    var query = `https://tempus.xyz/api/maps/name/${map}/zones/typeindex/map/1/records/list?limit=0`
                    console.log(query);
                    axios.get(query)
                        .then(function (response) {
                            var rankIndex = 0;
                            var timesLength = 0;
                            var data = response.data.results[classResponse].find(function (element, index, array) {
                                if (element.player_info.id == person.id) {
                                    rankIndex = index + 1;
                                    timesLength = array.length;
                                    return element;
                                }
                            });
                            if (data) {
                                var time = secondsToTimeFormat(data.duration);
                                client.say(channel, `(${classResponse == 'soldier' ? 'Solly' : 'Demo'}) ${data.name} is ranked ${rankIndex}/${timesLength} on ${map} with time: ${time}`);
                            }
                            else {
                                client.say(channel, 'no person or time found');
                            }

                        })
                        .catch(function (error) {
                            // handle error
                            client.say(channel, error.response.data.error);
                        })
                }
                else {
                    client.say(channel, `No person was found`);
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
                if (data.zone_counts.bonus) {
                    bonus = data.zone_counts.bonus > 1 ? ` | ${data.zone_counts.bonus} bonuses` : ` | 1 bonus`;
                }
                client.say(channel, `${mapName} by ${author}, ${mapTiers}${bonus}`);
            })
            .catch(function (error) {
                // handle error
                client.say(channel, error.response.data.error);
            })
    }
    function BonusTime(command, map, classResponse, index, bonusIndex) {
        if (index < 1 || isNaN(index)) { index = 1; }
        if (bonusIndex < 1 || isNaN(bonusIndex)) { bonusIndex = 1; }
        if (command === '!dbwr' || command === '!sbwr') { index = 1; }

        //var query = `https://tempus.xyz/api/maps/name/${map}/zones/typeindex/bonus/${bonusIndex}/records/list?limit=${index}`;
        var query = `https://tempus.xyz/api/maps/name/${map}/zones/typeindex/bonus/${bonusIndex}/records/list?start=${index}&limit=1`
        console.log(query);
        axios.get(query)
            .then(function (response) {
                var data = response.data.results[classResponse][0];
                if (data) {
                    var time = secondsToTimeFormat(data.duration);
                    //Tempus | (Solly) Boshy is ranked 2/47 on jump_rabbit_final3 with time: 10:48.06
                    client.say(channel, `(${classResponse == 'soldier' ? 'Solly' : 'Demo'}) ${data.name} is ranked ${data.rank} on ${map} bonus ${response.data.zone_info.zoneindex} with time: ${time}`);
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
    //todo add player.js feature back
    // add !playerinfo function for ranks and such
    // add course wr and times too
    // add !svid
    // maybe add !recent https://tempus.xyz/api/activity

    if (self) return;

    if (inMessage('!stime')) {
        var command = message.split(' ')[0];
        var map = ClosestsName(message.split(' ')[1]);
        var searchTerm = message.split(' ')[2];
        var index = message.split(' ')[2] - 0;
        if (!isNaN(searchTerm - 0)) {
            MapTime(map, 'soldier', command, index);
        }
        else {
            SearchPlayerAndTime(map, searchTerm, 'soldier');
        }
    }
    if (inMessage('!swr')) {
        var command = message.split(' ')[0];
        var map = ClosestsName(message.split(' ')[1]);
        var index = message.split(' ')[2] - 0;
        MapTime(map, 'soldier', command, index);
    }
    if (inMessage('!dtime')) {
        var command = message.split(' ')[0];
        var map = ClosestsName(message.split(' ')[1]);
        var searchTerm = message.split(' ')[2];
        var index = message.split(' ')[2] - 0;
        if (!isNaN(searchTerm - 0)) {
            MapTime(map, 'demoman', command, index);
        }
        else {
            SearchPlayerAndTime(map, searchTerm, 'demoman');
        }
    }
    if (inMessage('!dwr')) {
        var command = message.split(' ')[0];
        var map = ClosestsName(message.split(' ')[1]);
        var index = message.split(' ')[2] - 0;
        MapTime(map, 'demoman', command, index);
    }
    if (inMessage('!m') || inMessage('!mi')) {
        var map = ClosestsName(message.split(' ')[1]);
        MapInfo(map);
    }
    if (inMessage('!update') && userstate['user-id'] == 104466319) {
        UpdateMapNames();
    }
    if (inMessage('!sbtime')) {
        var command = message.split(' ')[0];
        var map = ClosestsName(message.split(' ')[1]);
        var index = message.split(' ')[2] - 0;
        var bonusIndex = message.split(' ')[3] - 0;
        BonusTime(command, map, 'soldier', index, bonusIndex)
    }
    if (inMessage('!dbtime')) {
        var command = message.split(' ')[0];
        var map = ClosestsName(message.split(' ')[1]);
        var index = message.split(' ')[2] - 0;
        var bonusIndex = message.split(' ')[3] - 0;
        BonusTime(command, map, 'soldier', index, bonusIndex)
    }
    if (inMessage('!sbwr')) {
        var command = message.split(' ')[0];
        var map = ClosestsName(message.split(' ')[1]);
        var index = message.split(' ')[2] - 0;
        var bonusIndex = message.split(' ')[3] - 0;
        BonusTime(command, map, 'soldier', index, bonusIndex)
    }
    if (inMessage('!dbwr')) {
        var command = message.split(' ')[0];
        var map = ClosestsName(message.split(' ')[1]);
        var index = message.split(' ')[2] - 0;
        var bonusIndex = message.split(' ')[3] - 0;
        BonusTime(command, map, 'soldier', index, bonusIndex)
    }
    //https://tempus.xyz/api/players/id/170674/rank
});