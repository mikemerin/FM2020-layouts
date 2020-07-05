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
    ":": " -"
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
    NodeCG.masterRunList.schedule.order = res.lines.map(({gameName}) => gameName );

    NodeCG.masterRunList.replicant = nodecg.Replicant("runs");
    const { name, namespace } = NodeCG.masterRunList.replicant;
    nodecg.readReplicant(name, namespace, replicantValues => {
      NodeCG.masterRunList.replicantValues = replicantValues;
      NodeCG.dashboardPanels.panels["masterRunList"].updateMasterRunFields(true);
      // console.log("replicantValuesMasterRunList:", NodeCG.masterRunList.replicantValues);
    })
  })


};

class SetReplicant {

  constructor() {
    this.runsReplicant = nodecg.Replicant("runs");
    this.fieldValuesreplicant = nodecg.Replicant("fieldValues");
    this.stagingFieldReplicant = nodecg.Replicant("stagingField");
    this.outputReplicant()
  }

  altNames = () => {
    const alts = {
      "Misuzu to Chiruno no Youkai no Yamadai Bouken Akushongemu": ""
    }
  }

  outputReplicant = () => {
    const {name, namespace} = this.runsReplicant;
    nodecg.readReplicant(name, namespace, replicantValues => {
      console.log(sanitize("Misuzu to Chiruno no Youkai no Yamadai Bouken Akushongemu"))
    })
  }

  forceSet = () => {
    this.runsReplicant.value = {}  // warning: use only when needed as this overwrites the replicant permanently
  };

  loadRunIntoDashboard = (gameName) => {
    NodeCG.dashboardPanels.replicantValues = this.fieldValuesreplicant.value = this.runsReplicant.value[gameName];
    ["gameInfo", "runInfo", "playerInfo", "adminPanel"].forEach(panel => {
      NodeCG.dashboardPanels.panels[panel].loadValues(true);
    })
  };

  saveRunFromDashboard = (gameName) => {
    this;

    let text = "Are you sure you want to";
    if (gameName === "Create New Run") {
      text += `make a new run for ${gameName}?`;
      // todo: check if on the schedule or not
    } else {
      const savedGameRun = this.runsReplicant.value[gameName];
      text += `update the following values for ${gameName}?`;
      debugger
    }

    var th = $("<tr>").append($("<th>"));
    var before = $("<tr>").append($("<th>", {text: before}));
    var after = $("<tr>").append($("<th>", {text: after}));


    ["gameInfo", "runInfo", "playerInfo", "adminPanel"].forEach(panel => {
        NodeCG.dashboardPanels.panels[panel].dashboardFields.forEach(({id, value}) => {
          th.append($("<th>", {text: id}));
          after.append($("<td>", {text: value}));
        })
    });

    const table = $("<table>").append(th, before, after);
    //
    // const modal = $("<div>", {
    //   id: "confirmModal",
    //   class: "modal"
    // }).append(table);

    const confirmation = confirm(text)
    debugger
    //confirm, show before/after
    // this.runsReplicant.value[gameName].gameInfo = this.fieldValuesreplicant.value;
  }

};

const setReplicant = new SetReplicant();
