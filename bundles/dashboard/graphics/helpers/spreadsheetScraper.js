// Note: this script is a copy/paste into the Chrome console. TODO: consolidate into program
entries = '';
headers = {};
games = {};
gamesByName = {};

sanitize = (str) => {
  var replace = {
    "#": "number",
	  '"': "",
    ":": "",
    "-": "",
    ".": "",
    "'": "",
    "!": "",
    "~": "",
  };
  str = str.trim().toString().toLowerCase().replace(/[#:\-\.'!~]/g, (matched) => replace[matched]);
  str = str.replace(/ {1,}/g, " ");
  return str.replace(/\s([\w|\d])/g, ($1) => $1[1].toUpperCase());
};

fields = {
	category: {
		name: "category",
		group: "runInfo"
	},
	commentators: {
		name: "commentators",
		group: "playerInfo"
	},
	commentator_pronouns: {
		name: "commentator_pronouns",
		group: "runInfo"
	},
	createdBy: {
		name: "createdBy",
		group: "gameInfo"
	},
	estimate: {
		name: "estimate",
		group: "runInfo"
	},
	gameName: {
		name: "gameName",
		group: "gameInfo"
	},
	numberOfPlayers: {
		name: "numberOfPlayers",
		group: "playerInfo"
	},
	pronouns: {
		name: "pronouns",
		group: "playerInfo",
        prependPlayer: true,
	},
	resolution: {
		name: "resolution",
		group: "gameInfo",
		map: true
	},
	displayName: {
		name: "displayName",
		group: "playerInfo",
        prependPlayer: true,
	},
	pb: {
		name: "pb",
		group: "playerInfo",
        prependPlayer: true,
	},
	twitchHandle: {
		name: "twitchHandle",
		group: "playerInfo",
        prependPlayer: true,
	},
	runType: {
		name: "runType",
		group: "runInfo"
	},
	camera: {
		name: "camera",
		group: "playerInfo",
        prependPlayer: true,
		map: true,
	},
	worldRecord: {
		name: "worldRecord",
		group: "runInfo",
	},
}

mapping = {
    'Category': fields.category.name,
    'Commentary Handle(s) (put N/A if doing it yourself)': fields.commentators.name,
    'Commentator Pronouns': fields.commentator_pronouns.name,
    'Created By': fields.createdBy.name,
    'Estimate': fields.estimate.name,
    'Game': fields.gameName.name,
    'Players': fields.numberOfPlayers.name,
    'Pronouns': fields.pronouns.name,
    'Resolution': fields.resolution.name,
    'Runner Name(s)': fields.displayName.name,
    'Runner PB(s)': fields.pb.name,
    'Twitch Handle(s)': fields.twitchHandle.name,
    'Type': fields.runType.name,
    'Using Webcam': fields.camera.name,
    'WR': fields.worldRecord.name,

	'1:1': '1:1',
	'3:2': '3:2',
	'4:3 (800x600 1024x768 etc)': '600',
	'8:7 (256x224 800x700 etc)': '8:7',
	'16:9 (1920x1080 1280x720 etc)': '16:9',
	'10:7 (714x500)': '10:7',
	'800 x 608': '608',

	'Yes': true,
	'No': false,
	'Not Sure': false,
}

defaultGameInfo = {
    "gameInfo": {
      "gameName": null,
      "resolution": null,
      "createdBy": null
    },
    "playerInfo": {
      "numberOfPlayers": null,
      "player1_twitchHandle": null,
      "player1_displayName": null,
      "player1_camera": false,
      "player1_pb": null,
      "player2_twitchHandle": null,
      "player2_displayName": null,
      "player2_camera": false,
      "player2_pb": null,
      "player3_twitchHandle": null,
      "player3_displayName": null,
      "player3_camera": false,
      "player3_pb": null,
      "player4_twitchHandle": null,
      "player4_displayName": null,
      "player4_camera": false,
      "player4_pb": null,
      "commentators": null
    },
    "runInfo": {
      "category": null,
      "estimate": null,
      "runType": null,
      "worldRecord": null,
      "wrHolder": null
    },
    "adminPanel": {
      "backgroundOpacity": '.3'
    }
}

URL = "https://spreadsheets.google.com/feeds/cells/1O3dkoJ_oU2m1gToOarV3SebkbmtkDdmteZJ6f11G_pg/1/public/full?alt=json";
fetch(URL).then(x => x.json()).then(x => entries = x.feed.entry).then(() => {

    currentPlayer = 1;
	loop = true;
    entries.slice(4).forEach((entry) => {
        if (loop) {
            let { row, col, inputValue } = entry['gs$cell'];
            if (inputValue === "END OF INPUT") {
                console.log('end: ', entry);
                loop = false;
            } else {
                if (row === '5') {
                    headers[col] = mapping[inputValue];
                } else {
                    if (!games[row]) {
                        if (col === '1') {
							currentPlayer = 1;
                            games[row] = { ...defaultGameInfo };
                        } else {
							loopMultiPlayer:
							for (let r = 1; r < 4; r++) {
								gameRow = (parseInt(row) - r);
								if (games[gameRow]) {
									currentPlayer = r + 1;
									row = gameRow.toString();
									break loopMultiPlayer;
								}
							}
                        }
                    }
                    let fieldName = headers[col];
                    let { group, map, prependPlayer } = fields[fieldName];
                    if (prependPlayer) fieldName = `player${currentPlayer}_${fieldName}`;
                    let value = map ? mapping[inputValue] : inputValue;
                    games[row] = {
                        ...games[row],
                        [group]: {
                            ...games[row][group],
                            [fieldName]: value
                        }
					}
                }
            }
        }
    });

    gamesByName = Object.keys(games).reduce((acc, el) => {
        gameName = sanitize(games[el].gameInfo.gameName);
        acc[gameName] = games[el];
        return acc;
    }, {});
    console.log(gamesByName);
    // manually type in copy(gamesByName) and paste into runsBackup
});
