// // todo: convert this to the global scope class to be able to just call them anywhere
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

// class GlobalFunctions {
//
//   sanitize = (str) => {
//     var replace = {
//       "#": "number",
//       "-": ""
//     };
//     str = str.toString().toLowerCase().replace(/[#-]/g, (matched) => replace[matched]);
//     return str.replace(/\s(\w)/g, ($1) => $1[1].toUpperCase());
//   }
//
// }
