const fs = require('fs');
let mapNames = JSON.parse(fs.readFileSync('./MapNames.json'));

async function UpdateMapNames() {
    var query = 'https://tempus.xyz/api/maps/detailedList';
    const axios = require('axios');
    return await axios.get(query)
        .then(function (response) {
            var maps = [];
            response.data.forEach(element => {
                maps.push(element.name);
            });
            let currentMaps = JSON.parse(fs.readFileSync('./MapIntended.json'));
            let notAdded = maps.filter(map => {
                let missing = 0;
                for (var classType in currentMaps) {
                    if (currentMaps[classType].includes(map) == false) {
                        missing++;
                    }
                }
                if (missing > 3) {
                    return map;
                }
            })
            currentMaps["unknown"].push(...notAdded);
            fs.writeFileSync('MapIntended.json', JSON.stringify(currentMaps));
            fs.writeFileSync('MapNames.json', JSON.stringify(maps));
            mapNames = maps;
            console.log('Map list has been updated!');
            return true;
        })
        .catch(function (error) {
            console.log(error.response.data.error);
            return false;
        })
}
let Unknown = {
    ListMaps: function () {
        try {
            maps = JSON.parse(fs.readFileSync('./MapIntended.json'));
            let message = '';
            maps["unknown"].forEach(map => message += map + ', ');
            return message.substring(0, message.length - 2);
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    Add: function (map, classType) {
        try {
            maps = JSON.parse(fs.readFileSync('./MapIntended.json'));
            if (maps["unknown"].includes(map)) {
                maps[classType].push(map);
                maps["unknown"].splice(maps["unknown"].indexOf(map), 1);
                fs.writeFileSync('MapIntended.json', JSON.stringify(maps));
                return true;
            }
            else {
                return false;
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    Remove: function (map) {
        try {
            maps = JSON.parse(fs.readFileSync('./MapIntended.json'));
            let result = false;
            for (var classType in maps) {
                if (maps[classType].includes(map)) {
                    maps[classType].splice(maps[classType].indexOf(map), 1);
                    fs.writeFileSync('MapIntended.json', JSON.stringify(maps));
                    result = true;
                }
            }
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    Duplicates: function (map) {
        try {
            if (map) {
                map = StripVersion(map);
                let mapRegex = new RegExp(map, "g");
                maps = JSON.parse(fs.readFileSync('./MapIntended.json'));
                let duplicates = '';
                for (var classType in maps) {
                    for (let i = 0; i < maps[classType].length; i++) {
                        if (maps[classType][i].match(mapRegex)) {
                            duplicates += maps[classType][i] + ', ';
                        }
                    }
                }
                return duplicates.substring(0, duplicates.length - 2);
            }
            else {
                return '';
            }

        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    MessageToMapObject: function (ListOfMapsAndTiers) {
        MapsObject = ListOfMapsAndTiers.split(' |')
            .map(m =>
                m.split(' ')
                    .splice(-3, 3))
            .map(m => m = { "map": m[0], "classType": m[2].toLowerCase() }
            );
        MapsObject.splice(-1, 2);
        return MapsObject;
    }
}
function ClosestsName(queryName) {
    var foundMap;
    try {
        var mapRegex = new RegExp(queryName, "g");
        for (let i = 0; i < mapNames.length; i++) {
            if (mapNames[i].match(mapRegex)) {
                foundMap = mapNames[i];
                break;
            }
        }
    } catch (error) {
        console.log(error);
    }
    return foundMap;
}
let Random = {
    Map: function () {
        let rand = Math.floor(Math.random() * mapNames.length);
        return mapNames[rand];
    },
    ClassMap: function (className) {
        let mapIntended = JSON.parse(fs.readFileSync('./MapIntended.json'));
        let rand = Math.floor(Math.random() * mapIntended[className].length);
        return mapIntended[className][rand];
    }
}
function Intended(map) {
    let mapIntended = JSON.parse(fs.readFileSync('./MapIntended.json'));
    for (var classType in mapIntended) {
        if (mapIntended[classType].includes(map) && classType != "unknown") {
            return classType.charAt(0);
        }
    }
    return "";
}
function StripVersion(map) {
    var pattern = /(_rc|_v|_b|_a)[0-9]\w{0,}/g;
    if (pattern.test(map)) {
        return map.replace(pattern, '');
    }
    else {
        return map;
    }
}
function secondsToTimeStamp(seconds) { //Larry's
    var sign = "";
    if (seconds < 0) {
        sign = "-";
    }
    seconds = Math.abs(seconds);

    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var milliseconds = Math.floor((seconds - Math.floor(seconds)) * 1000);
    seconds = Math.floor(seconds % 60);

    var timeStamp = sign;

    if (hours > 0) {
        if (hours >= 10) timeStamp += hours + ":";
        else timeStamp += "0" + hours + ":";
    }

    if (minutes >= 10) timeStamp += minutes + ":";
    else timeStamp += "0" + minutes + ":";

    if (seconds >= 10) timeStamp += seconds + ".";
    else timeStamp += "0" + seconds + ".";

    if (milliseconds >= 100) timeStamp += milliseconds;
    else if (milliseconds >= 10) timeStamp += "0" + milliseconds;
    else timeStamp += "00" + milliseconds;

    return timeStamp;
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
let Disabled = {
    disabledList: [],
    Find: function (channelName) {
        return this.disabledList.find(name => name === channelName);
    },
    Add: function (channelName) {
        if (this.disabledList.find(name => name === channelName)) {
            return false;
        }
        else {
            this.disabledList.push(channelName);
            return true;
        }
    },
    Remove: function (channelName) {
        if (this.disabledList.find(name => name === channelName)) {
            this.disabledList.splice(this.disabledList.indexOf(channelName), 1);
            return true;
        }
        else {
            return false;
        }
    }
}

exports.ClosestsName = ClosestsName;
exports.StripVersion = StripVersion;
exports.UpdateMapNames = UpdateMapNames;
exports.secondsToTimeFormat = secondsToTimeFormat;
exports.secondsToTimeStamp = secondsToTimeStamp;
exports.Intended = Intended;
exports.Random = Random;
exports.Unknown = Unknown;
exports.Disabled = Disabled;