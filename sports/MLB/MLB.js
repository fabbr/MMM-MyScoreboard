// Module for MLB scores
const moment = require('moment-timezone');

module.exports = 
{

  name: "MLB",

  teamsToFollow:[],

  configure: function(teams) {
    this.teamsToFollow = teams;
  },

  getUrl: function(date) {
    var d = moment(date);
    var url = "http://gd2.mlb.com/components/game/mlb/year_" + d.format('YYYY') +
    "/month_" + d.format('MM') +
    "/day_" + d.format('DD') + 
    "/master_scoreboard.json";

    return url;
  },
  
  getInningSection: function(i) {
    switch(i) {
      case "Top":
        return "TOP";
        break;
      case "Middle":
        return "MID";
        break;
      case "Bottom":
        return "BOT";
        break;
      case "End":
        return "END";
        break;
      default:
        return i;
        break;
    }
  },

  getOrdinal: function(i) {
    var j = i % 10,
      k = i % 100;
    if (j == 1 && k != 11) {
      return i + "<sup>ST</sup>";
    }
    if (j == 2 && k != 12) {
      return i + "<sup>ND</sup>";
    }
    if (j == 3 && k != 13) {
      return i + "<sup>RD</sup>";
    }
    return i + "<sup>TH</sup>";
  },

  processData: function(data) {


    var self = this;
    var formattedGamesList = new Array();

    if (data.data.games && data.data.games.game) {


      data.data.games.game.forEach( function(game) {


        if (self.teamsToFollow.indexOf(game.home_name_abbrev) != -1 || 
          self.teamsToFollow.indexOf(game.away_name_abbrev) != -1) {

            var gameState;
            var status;

            console.log("game.status.status: " + game.status.status);

            switch(game.status.status) {
              case "In Progress":
                gameState = 1;
                status = self.getInningSection(game.status.inning_state) + " " + self.getOrdinal(Number(game.status.inning));
                break;
              case "Delayed" :
              case "Postponed" :
                gameState = 1; //so time won't be lit up
                status = "<span class='delay'>Delayed<br />(" + self.getOrdinal(Number(game.status.inning)) + ")</span>";
                break;
              case "Game Over":
              case "Final" :
                gameState = 2;
                status = "Final" + (Number(game.status.inning) > 9 ? " (" + game.status.inning + ")" : "");
                break;
              case "Preview":
              case "Pre-Game":
              case "Warmup": 
              default: //game in future
                gameState = 0;
                var localTZ = moment.tz.guess();
                status = moment.tz(game.time_date + ' ' + game.ampm, 'YYYY/MM/DD h:mm A', 'America/Toronto').tz(localTZ).format('h:mm a');
                break;
            }


            formattedGamesList.push({
              gameMode: gameState,
              hTeam: game.home_name_abbrev,
              vTeam: game.away_name_abbrev,
              hScore: game.linescore ? game.linescore.r.home : "0",
              vScore: game.linescore ? game.linescore.r.away : "0",
              status: status

            });

        }



      });

    }

    return formattedGamesList;

  }

}