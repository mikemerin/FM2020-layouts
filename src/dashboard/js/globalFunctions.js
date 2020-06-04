// todo: add this to api.js (and min) this to the global scope class to be able to just call them anywhere
const initReplicants = () => {
  NodeCG.dashboardPanels.replicant = nodecg.Replicant("fieldValues");

  const { name, namespace } = NodeCG.dashboardPanels.replicant;

  nodecg.readReplicant(name, namespace, replicantValues => {
    NodeCG.dashboardPanels.replicantValues = replicantValues;

    Object.keys(NodeCG.dashboardPanels.panels).forEach(panel => {
      NodeCG.dashboardPanels.panels[panel].loadValues(true);
    });
  });
};

const sanitize = (str) => {
  var replace = {
    "#": "number",
    "-": ""
  };
  str = str.toString().toLowerCase().replace(/[#-]/g, (matched) => replace[matched]);
  return str.replace(/\s(\w)/g, ($1) => $1[1].toUpperCase());
}

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
