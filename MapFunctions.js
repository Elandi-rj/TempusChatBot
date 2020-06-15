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
            console.log('Map list has been updated!');
        })
        .catch(function (error) {
            // handle error
            console.log(error.response.data.error);
        })
}
function ClosestsName(queryName) {
    var mapNames = require('./MapNames').list;
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

exports.ClosestsName = ClosestsName;
exports.UpdateMapNames = UpdateMapNames;
