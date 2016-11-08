const path = require('path');
const fs = require('fs');
const readline = require('readline');

const headers = [
  {ts: null},
  {scss: null},
  {html: null}
];

headers.ts =
`/**
 * Copyright (C) 2016 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */`;

// for now, ts and scss files will have the same header
headers.scss = headers.ts;

headers.html =
`<!-- Copyright (C) 2016 Linagora

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>. -->`;

// ----------------------------------------------------------------------------------

const generateFileTree = function(dir, filelist) {
  let files = fs.readdirSync(dir);

  filelist = filelist || {ts: [], scss: [], html: []};

  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = generateFileTree(path.join(dir, file), filelist);
    }

    else {
      if (file.endsWith('.ts')) {
        filelist.ts.push(path.join(dir, file));
      }

      else if (file.endsWith('.scss')) {
        filelist.scss.push(path.join(dir, file));
      }

      else if (file.endsWith('.html')) {
        filelist.html.push(path.join(dir, file));
      }
    }
  });

  return filelist;
};

// check if a header is already available and
// inject the corresponding header otherwise
const checkHeaderAndInjectIfNeeded = (fileType, filePath, headerSplit) => {
  let fileSplit = fs.readFileSync(filePath).toString().trim().split('\n');
  let filePotentialHeader = fileSplit.slice(0, headerSplit.length).join('\n');

  if (filePotentialHeader === headerSplit.join('\n')) {
    return;
  }

  // no header, we need to inject it
  let fileWithInjectedHeader = headerSplit.join('\n') + '\n\n' + fileSplit.join('\n');
  fs.writeFile(filePath, fileWithInjectedHeader, (err) => {
    if(err) {
      return console.log(err);
    }

    console.log(`updated : ${filePath}`);
  });
};

const main = () => {
  // generate the file tree
  let fileTree = generateFileTree('./src/app');

  // for each type of file
  Object.keys(fileTree).forEach((fileType) => {
    let filesPath = fileTree[fileType];

    // save split header here otherwise the split will happen
    // as many time as we call checkHeaderAndInjectIfNeeded function
    let headerSplit = headers[fileType].split('\n');

    filesPath.forEach(filePath => checkHeaderAndInjectIfNeeded(fileType, filePath, headerSplit));
  });
};

main();
