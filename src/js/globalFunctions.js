// // todo: convert this to the global scope class to be able to just call them anywhere
const sanitize = (str) => {
  var replace = {
    "#": "number",
    "-": ""
  };
  str = str.toString().toLowerCase().replace(/[#-]/g, (matched) => replace[matched]);
  return str.replace(/\s(\w)/g, ($1) => $1[1].toUpperCase());
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
