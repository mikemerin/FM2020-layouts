// todo: add this to api.js (and min) this to the global scope class to be able to just call them anywhere
const getGameNameTitle = (gameName) => {
  return gameName.replace(/(I Wanna |Be the )/gi, "");
};

const sanitize = (str) => {
  var replace = {
    "#": "number",
    ":": "",
    "-": "",
    ".": "",
    "'": "",
    "!": ""
  };
  str = str.trim().toString().toLowerCase().replace(/[#:\-\.'!]/g, (matched) => replace[matched]);
  str = str.replace(/ {1,}/g, " ");
  return str.replace(/\s([\w|\d])/g, ($1) => $1[1].toUpperCase());
};

const sanitizeFilename = (str) => {
  var replace = {
    "#": "number",
    ":": ""
  };
  return str.replace(/[#:]/g, (matched) => replace[matched]);
};

function deepMerge(target, source) {
  const isObject = (obj) => obj && typeof obj === 'object';

  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  Object.keys(source).forEach(key => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      target[key] = targetValue.concat(sourceValue);
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = deepMerge(Object.assign({}, targetValue), sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });

  return target;
}

const doesFileExist = (url, asset = false) => {
  if (asset) url = "/assets/dashboard/" + url;
  var http = new XMLHttpRequest();
  http.open('HEAD', url, false); // todo: use FS or something better; it needs to be async which gives the error
  http.send();
  const status = http.status !== 404;
  if (!status) console.log(`Note for the HEAD error above:\n${url}\nIf this file is a gameBackgroundsAlt image, please ignore this error`);
  return status;
};

const changeCSSRule = (ruleKey, ruleValue, cssTextName, cssText) => {
  var sheet = document.styleSheets[0];
  var rules = sheet.cssRules || sheet.rules;
  for (let i = 0; i < rules.length; i++) {
      if (rules[i][ruleKey] === ruleValue) {
          rules[i].deleteRule(cssTextName);
          rules[i].appendRule(cssTextName + cssText);
          break;
      }
  };
};

const initReplicants = () => {
  initFieldValues();
  initRuns();
};

const initFieldValues = () => {
  NodeCG.dashboardPanels.replicant = nodecg.Replicant("fieldValues");
  const { name, namespace } = NodeCG.dashboardPanels.replicant;

  nodecg.readReplicant(name, namespace, replicantValues => {
    NodeCG.dashboardPanels.replicantValues = replicantValues;
    // console.log("replicantValuesFieldValues:", replicantValues);

    Object.keys(NodeCG.dashboardPanels.panels).forEach(panel => {
      NodeCG.dashboardPanels.panels[panel].loadValues(true);
    });
  });
};

const initRuns = () => {

  const url = "https://oengus.io/api/marathon/fm2020/schedule";
  fetch(url).then(resp => resp.json()).then(res => {
    // var mrl = nodecg.Replicant("oengusRunOrder");
    // mrl.value = res.lines; // todo: implement this correctly
    NodeCG.masterRunList.schedule.order = res.lines.map(({gameName}) => gameName );

    NodeCG.masterRunList.replicant = nodecg.Replicant("runs");
    const { name, namespace } = NodeCG.masterRunList.replicant;
    nodecg.readReplicant(name, namespace, replicantValues => {
      NodeCG.masterRunList.replicantValues = replicantValues;
      updateMasterRunList();
      // console.log("replicantValuesMasterRunList:", NodeCG.masterRunList.replicantValues);
    })
  })


};

const updateMasterRunList = () => {
  NodeCG.dashboardPanels.panels["masterRunList"].dashboardFields.find(field => {
      if (field.id === "masterRunList") field.updateValue(true);
  });
};

class SetReplicant {

  constructor() {
    this.runsReplicant = nodecg.Replicant("runs");
    this.fieldValuesReplicant = nodecg.Replicant("fieldValues");
    this.stagingFieldReplicant = nodecg.Replicant("stagingField");
    // this.outputReplicant();
  }

  // altNames = () => { maybe for the future
  //   const alts = {
  //     "Misuzu to Chiruno no Youkai no Yamadai Bouken Akushongemu": "美鈴とチルノの妖怪の山大冒険"
  //   }
  // }

  outputReplicant(replicantName = "runsReplicant", gameName = "all") {
    const {name, namespace} = this[replicantName];
    nodecg.readReplicant(name, namespace, replicantValues => {
      console.log("replicantValues:", replicantValues);
      Object.keys(replicantValues).forEach(run => {
        console.log(replicantValues[run]);
      });
    })
  };

  forceSet() {
    // this.runsReplicant.value = {}  // warning: use only when needed as this overwrites the replicant permanently
    // this.runsReplicant.value =
    console.log("Force Set New Value")
    console.log("this.runsReplicant.value:", this.runsReplicant.value);
  };

  loadRunIntoDashboard(gameName) {
    // console.log("setReplicant:", setReplicant);
    // console.log("NodeCG.adminPanel:", NodeCG.adminPanel);
    NodeCG.dashboardPanels.replicantValues = this.runsReplicant.value[sanitize(gameName)];
    this.fieldValuesReplicant.value = this.runsReplicant.value[sanitize(gameName)];
    ["gameInfo", "runInfo", "playerInfo", "adminPanel"].forEach(panel => {
      NodeCG.dashboardPanels.panels[panel].loadValues(true);
    })
    NodeCG.adminPanel.setDropdownGameName(gameName);
  };

  saveRunFromDashboard(gameName) {
    let gameNameConfirmation = false;
    let fieldsChanged = 0;
    let text = "Are you sure you want to ";
    let textChanged = "";

    if (gameName === "Create New Run") {
      text += `make a new run for ${gameName}?`;
      // todo: check if on the schedule or not
    } else {
      const savedGameRun = this.runsReplicant.value[sanitize(gameName)];
      ["gameInfo", "runInfo", "playerInfo", "adminPanel"].forEach(panel => {
          NodeCG.dashboardPanels.panels[panel].dashboardFields.forEach(({id, value}) => {
            const savedValue = savedGameRun[panel][id];
            if (value !== savedValue) {
              if (id === "gameName") {
                gameNameConfirmation = `Warning: game names in field and dropdown are different:\n\nGame Name Field:\n${value}\n\nDropdown:\n${gameName}\n\nAre you sure you want to save this?`;
              }
              fieldsChanged++;
              textChanged += `\n${id}: ${savedValue} -> ${value}`;
            };
          })
      })
    }

    if (gameNameConfirmation && !confirm(gameNameConfirmation)) return;

    text += `update the following ${fieldsChanged} field(s) for\n${gameName}?\n`;
    if( fieldsChanged && confirm(text + textChanged) ) {
      NodeCG.dashboardPanels.panels.adminPanel.saveFields(gameName);
    };
  }

};

const setReplicant = new SetReplicant();


// future: awful having to put this here since I can't access in bundles/dashboard/dashboard/js/adminPanel.js

class AdminPanel {

  constructor() {
    this.gameNameInput = this.getInput("gameInfo", "gameName");
    this.gameName;
  }

  setRunSearch() {

  };

  gameChecks() {
    // debugger
  };

  setAvatarCheck() {

  };

  setFieldsInfo() {

  };

  setRunSaveLoadButtons() {
    const label = $("<label>", { text: "Default run info for" });

    const loadButton = $("<button>", {
      id: "adminPanelLoadRunInfoButton",
      class: "halfButton",
      text: "Load",
      click: () => {
        this.gameName = $("#gameNameAdmin").val();
        setReplicant.loadRunIntoDashboard(this.gameName);
      }
    });

    const saveButton = $("<button>", {
      id: "adminPanelSaveRunInfoButton",
      class: "halfButton",
      text: "Save",
      click: () => {
        this.gameName = $("#gameNameAdmin").val();
        setReplicant.saveRunFromDashboard(this.gameName);
      }
    });

    $("#adminPanelInsertGameInfo").append(label, this.gameNameInput, loadButton, saveButton);
  }

  getInput(fieldGroup, field) {
    const runsReplicant = nodecg.Replicant('runs');
    const fieldValuesReplicant = nodecg.Replicant('fieldValues');
    const { name, namespace } = runsReplicant;
    const { name: fieldName, namespace: fieldNamespace } = fieldValuesReplicant;

    var dropdown = $("<select>", {
      id: field + "Admin",
      class: "inputSelect"
    });

    nodecg.readReplicant(name, namespace, replicantValues => {
      nodecg.readReplicant(fieldName, fieldNamespace, fieldReplicantValues => {
        // var options = Object.keys(replicantValues).map(game => {
        //   return replicantValues[game][fieldGroup][field];
        // });
        // }).sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase()) ); // todo: remove?

        var options = NodeCG.masterRunList.schedule.order.filter(x => x);
        if (!options.length) options = ["I Wanna Eclipse", "Super Metroid Ascent", "Star Revenge 2.5: Remnant of Doom", "Chill Needle 2", "Rockman 4 Burst Chaser x Air Sliding", "Fish Out Of Water", "Gensou Skydrift", "I Wanna Be The Neon 3", "I Wanna Be The Salt", "I Wanna KeyPick 100", "Ghost Mechanism", "SM64: Last Impact", "Super Mario Odyssey 64", "Blind I Wanna Maker", "I Wanna Be The Guy", "I Wanna Be The Guy: Gaiden", "NitorInc.", "Make a Good Mega Man Level 2", "Sunlust", "Avoidance Tournament", "Super Metroid Y-Faster 2 Fast", "Nimpize Adventure", "Sonic Chrono Adventure", "Densha de D: Lightning Stage", "I Wanna See The Moon", "I Wanna Kill The Guy", "Piece's Extravaganza", "Mystery Game", "Gm8Emulator TAS Showcase", "Needle", "I Wanna Be The Justice", "I Wanna Whisper In Mirror", "Star Revenge 2: Night of Doom", "Grief Syndrome", "Maid Made Maze", "Metroid Fusion: Oil Spill", "Blind Adventure Race", "I Wanna Be The Co-op", "Blind Needle Race", "I Wanna Be The Strongest Fairy", "Designer L's Wacky Randventure!", "Waluigi's Taco Stand", "Coinflip Tournament", "Fangame Music DJ Set", "I Wanna Be The Platinum", "I Wanna Be The Computer 2", "I Wanna Be The With Friendsβ", "Blind Sudoku Race", "I Want", "I Wanna Be The Emperor", "Mario Party 64", "I Wanna Leave This Hell", "I Wanna Be The Destination", "Super Mario 63", "New Mini Kongkongi's Adventure", "Fangame Music Quiz", "Touhou Luna Nights", "Touhou Danmakufu", "Relay Race", "Mystery Finale Game", "I Wanna Make A Sandwich", "Crimson Needle 3", "Piece's Bonus Extravaganza", "Misuzu to Chiruno no Youkai no Yamadai Bouken Akushongemu", "Super Mario 74 Extreme Edition", "Draw My Guy"];

        // todo: work on this backup
        //
        // console.log("options:", options);

        this.gameName = fieldReplicantValues.gameInfo.gameName;

        options.forEach((value, i) => {
          dropdown.append($("<option>", {
            text: `${i+1}) ${value}`,
            value: value
          }));
        })

        this.setDropdownGameName(this.gameName);
      });
    });

    return dropdown;
  };

  setDropdownGameName(gameName = this.gameName) {
    if (gameName !== this.gameName) this.gameName = gameName;
    Array.from(this.gameNameInput[0].options).forEach(option => {
      option.selected = (option.value === this.gameName);
    });
  }

  setStagingSendButton() {

  };

  setPreviewButton() {

  };

  setLoadLayoutInfo() {
    const text = "Layout window for";
    const temporaryId = "Open temporary url\nwith shown values";
    const permanentId = "Open permanent url\nwith run values";

    $("#loadLayout").append( //todo: next
      $("<label>", {
        id: sanitize(text),
        text: text
      })
    );

    $("#loadLayout").append( //todo: next
      $("<button>", {
        id: sanitize(temporaryId) + "Window",
        class: "loadButton",
        text: temporaryId
      })
    );

    $("#loadLayout").append( //todo: next
      $("<button>", {
        id: sanitize(permanentId) + "Window",
        class: "loadButton",
        text: permanentId
      })
    );

    const replicant = nodecg.Replicant("fieldValues");

    replicant.on("change", (newValue, oldValue) => {
      const temporaryLoadButton = $("#" + sanitize(temporaryId) + "Window"); //todo: next
      const permanentLoadButton = $("#" + sanitize(permanentId) + "Window"); //todo: next
      temporaryLoadButton.off();
      permanentLoadButton.off();

      var labelText = "Cannot load layout until more info is chosen";

      if (newValue && newValue["playerInfo"] && newValue["gameInfo"] ) {
        const numberOfPlayers = newValue["playerInfo"]["numberOfPlayers"];
        const { resolution, gameName } = newValue["gameInfo"];
        labelText = text + "<br>" + numberOfPlayers + "P " + resolution + " - " + getGameNameTitle(gameName);

        temporaryLoadButton.on("click", (e) => {
          e.preventDefault();
          if (!!numberOfPlayers && numberOfPlayers !== "N/A" && !!resolution && resolution !== "N/A") {
            var url = "http://localhost:9090/bundles/dashboard/graphics/layout.html";
            window.open(url);
          };
        });

        permanentLoadButton.on("click", (e) => {
          e.preventDefault();
          if (!!numberOfPlayers && numberOfPlayers !== "N/A" && !!resolution && resolution !== "N/A") {
            var url = `http://localhost:9090/bundles/dashboard/graphics/layout.html?gameName=${newValue["gameInfo"].gameName}`;
            window.open(url);
          };
        });
      } else { //todo: remove else statement
        currentLoadButton.off();
        defaultLoadButton.off();
      }

      $("#" + sanitize(text)).html(labelText); //todo: next
    });
  };

};

NodeCG.adminPanel = new AdminPanel;
