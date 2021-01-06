let mapNames = require('./MapNames').list;
function UpdateMapNames() {
    var query = 'https://tempus.xyz/api/maps/detailedList';
    const axios = require('axios');
    axios.get(query)
        .then(function (response) {
            var maps = [];
            response.data.forEach(element => {
                maps.push(element.name);
            });
            var fs = require('fs');
            fs.writeFileSync('MapNames.js', 'exports.list =' + JSON.stringify(maps));
            mapNames = maps;
            console.log('Map list has been updated!');
        })
        .catch(function (error) {
            console.log(error.response.data.error);
        })
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
exports.ClosestsName = ClosestsName;
exports.UpdateMapNames = UpdateMapNames;
exports.secondsToTimeFormat = secondsToTimeFormat;
exports.secondsToTimeStamp = secondsToTimeStamp;