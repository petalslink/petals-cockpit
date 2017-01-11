const fs = require('fs');

const package = `
  {
    "name"    : "${ require('../package.json').name}",
    "version" : "${ require('../package.json').version}",
    "main"    : "electron.js"
  }
`;

fs.writeFile('./dist/package.json', package, err => {
  if (err) {
    return console.log(err);
  }
});
