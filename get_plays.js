var _ = require("lodash")
var https = require('https')
var parseString = require('xml2js').parseString
var util = require('util')

var plays = {}

var user = process.argv[2];
if (!user) {
  throw Error('missing USER')
}

function formatPlays() {
  var plays_json = {
   name: "plays"
  }
  plays_json['children'] = _.map(plays, function(game, name) {
    return {
      name: name,
      children: [{
        name: name,
        size: game.count
      }]
    }
  })
  console.log(JSON.stringify(plays_json))
}

function xmlToJson(xml) {
  parseString(xml, function (err, result) {
    _.forEach(result.plays.play, function(game) {
      if (game.item[0]['$'].name in plays) {
        plays[game.item[0]['$'].name].count++
      } else {
        plays[game.item[0]['$'].name] = {
          count: 1,
          objectid: game.item[0]['$'].objectid
        } 
      }
    })
    if (parseInt(result.plays['$'].total)<100*parseInt(result.plays['$'].page)) {
      formatPlays()
    } else {
      getPlays(user, parseInt(result.plays['$'].page)+1)
    }
  });
}

function getPlays(user, page) {
  var address = util.format('https://www.boardgamegeek.com/xmlapi2/plays?username=%s&page=%d', user, page)
  https.get(address, function(res) {
    var data = '';

    res.on('data', function (chunk) {
      data += chunk;
    });

    res.on('end', function(){
      xmlToJson(data);
    })
  }).on('error', function(e) {
    console.error(e);
  });
}

getPlays(user, 1)