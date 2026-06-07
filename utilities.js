const fs = require('fs');
const { client } = require('tmi.js');

let mapNames = JSON.parse(fs.readFileSync('./MapNames.json'));

async function UpdateMapNames(DBmapsIntended) {
    var query = 'https://tempus2.xyz/api/v0/maps/detailedList';
    const axios = require('axios');
    return await axios.get(query)
        .then(function (response) {
            var maps = [];
            response.data.forEach(element => {
                maps.push(element.name);
            });
           maps.forEach(map => {
                var included = DBmapsIntended.filter(dbm => dbm.name == map);
                if (!included[0]) {
                    DBmapsIntended.push({name: map, class: ''})
                }
            });
            
            fs.writeFileSync('DBmaps.json', JSON.stringify(DBmapsIntended));
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
function UpdateMapNamesFromDB(DBmapsIntended) {
    let maps = DBmapsIntended.map(dbm => dbm.name);
    fs.writeFileSync('MapNames.json', JSON.stringify(maps));
    mapNames = maps;
    console.log('Map list has been updated from database!');
    return true;
}
let Unknown = {
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
        const regex = /^['"](.*)['"]$/;
        if (regex.test(queryName)){
            return queryName.replace(/["']/g, '');
        }
        if (queryName) {
            let first4letters = queryName.substring(0, 4);
            let first2letters = queryName.substring(0, 2);
            if (first4letters != 'jump' && first2letters != 'rj' && first2letters != 'sj') {
                let fullJumpName = 'jump_' + queryName;
                console.log(fullJumpName)
                let MatchingMap = FindMatchingMap(fullJumpName)
                if (MatchingMap) {
                    return MatchingMap;
                }
            }
            let MatchingMap = FindMatchingMap(queryName)
            if (MatchingMap) {
                return MatchingMap;
            }
        }
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
function FindMatchingMap(queryName) {
    var foundMap;
    if (queryName) {
        try {
            for (let i = 0; i < mapNames.length; i++) {
                if (mapNames[i] == queryName) {
                    foundMap = mapNames[i];
                    break;
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    return foundMap;
}
let Random = {
    Map: function (DBmaps) {
        let rand = Math.floor(Math.random() * DBmaps.length);
        return DBmaps[rand].name;
    },
    ClassMap: function (className, DBmaps) {
        let classMaps = DBmaps.filter(m => m.class == className);
        let rand = Math.floor(Math.random() * classMaps.length);
        return classMaps[rand].name;
    }
}
function Intended(map, DBmapIntended) {
    let foundMap = DBmapIntended.find(m => map == m.name)
    if (foundMap && foundMap.class) {
        return foundMap.class.charAt(0);
    }
    else { return '' }

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
function formatTime(ms, decimals = 3) { //Pear's
    if (!ms) return '0:00' + (decimals ? '.' + '0'.repeat(decimals) : '')

    let invert = false

    if (ms < 0) {
        invert = true
        ms = Math.abs(ms)
    }

    ms = ms / 1000
    let s = Math.floor(ms % 60)
    let m = Math.floor(ms / 60 % 60)
    let h = Math.floor(ms / 60 / 60)

    if (!h) h = null
    else if (!m) m = '00'
    if (!s) s = '00'

    let t = [h, m, s].filter(x => x !== null).map((x, i) => (i !== 0 && x < 10 && x !== '00') ? '0' + x : x)

    let decs = (ms % 1).toString().slice(2) + '0'.repeat(16)

    return (invert ? '-' : '') + t.join(':') + (decimals ? '.' + decs.slice(0, decimals) : '')
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
exports.FindMatchingMap = FindMatchingMap;
exports.StripVersion = StripVersion;
exports.UpdateMapNames = UpdateMapNames;
exports.UpdateMapNamesFromDB = UpdateMapNamesFromDB;
exports.secondsToTimeFormat = secondsToTimeFormat;
exports.secondsToTimeStamp = secondsToTimeStamp;
exports.formatTime = formatTime;
exports.Intended = Intended;
exports.Random = Random;
exports.Unknown = Unknown;
exports.Disabled = Disabled;