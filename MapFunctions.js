var fs = require('fs');
const axios = require('axios');

function UpdateMapNames() {
    var query = 'https://tempus.xyz/api/maps/detailedList';

    axios.get(query)
        .then(function (response) {
            var maps = [];
            response.data.forEach(element => {
                maps.push(element.name);
            });
            fs.writeFileSync('MapNames.js', JSON.stringify(maps));
            console.log('Map list has been updated!');
        })
        .catch(function (error) {
            // handle error
            console.error(channel, error.response.data.error);
        })
        .then(function () {
            // always executed
        });
}
function ClosestsName(queryName) {
    var foundMap;
    var mapRegex = new RegExp(queryName, "g");
    var mapNames = JSON.parse(fs.readFileSync('MapNames.js', 'utf8'));
    for (let i = 0; i < mapNames.length; i++) {
        if (mapNames[i].match(mapRegex)) {
            foundMap = mapNames[i];
            break;
        }
    }
    return foundMap;
}

exports.ClosestsName = ClosestsName;
exports.UpdateMapNames = UpdateMapNames;
