const mapNames = require('./MapNames').list;
function UpdateMapNames() {
    var query = 'https://tempus.xyz/api/maps/detailedList';
    const axios = require('axios');
    axios.get(query)
        .then(function (response) {
            var maps = [];
            response.data.forEach(element => {
                maps.push(element.name.replace('jump_', '').replace('rj_', ''));
            });
            var fs = require('fs');
            fs.writeFileSync('MapNames.js', 'exports.list =' + JSON.stringify(maps));
            console.log('Map list has been updated!');
        })
        .catch(function (error) {
            console.log(error.response.data.error);
        })
}
function ClosestsName(queryName) {
    var foundMap;
    try {
        var mapRegex = new RegExp('^' + queryName.replace('jump_', ''), "g");
        for (let i = 0; i < mapNames.length; i++) {
            if (mapNames[i].match(mapRegex)) {
                foundMap = mapNames[i];
                break;
            }
        }
    } catch (error) {
        console.log(error);
    }
    return 'jump_' + foundMap;
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