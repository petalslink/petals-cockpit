const path = require('path');
const fs = require('fs');
const readline = require('readline');

// folders
const sourceFolders = [
  './src/app',
  './e2e'
];

// individual files
const sourceFiles = {
  ts: [
    './src/test.ts',
    './src/main.ts'
  ],

  scss: [
    './src/styles.scss',
    './src/custom-theme.scss',
    './src/_libs.scss'
  ],

  html: []
};

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

// arguments
const args = {
  dry: false
};

process.argv.forEach(arg => {
  if (arg === '--dry') {
    args.dry = true;
  }
});

// ----------------------------------------------------------------------------------

const generateFileTree = (dir, filelist) => {
  let files = fs.readdirSync(dir);

  filelist = filelist || {ts: [], scss: [], html: []};

  files.forEach((file) => {
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
const checkHeaderAndInjectIfNeeded = (fileType, filePath, headerSplit, stats) => {
  let fileSplit = fs.readFileSync(filePath).toString().trimLeft().split('\n');
  let filePotentialHeader = fileSplit.slice(0, headerSplit.length).join('\n');

  if (filePotentialHeader === headerSplit.join('\n')) {
    return;
  }

  // no header, we need to inject it
  let fileWithInjectedHeader = headerSplit.join('\n') + '\n\n' + fileSplit.join('\n');

  stats[fileType]++;

  if (!args.dry) {
    fs.writeFileSync(filePath, fileWithInjectedHeader);
  }
};

const main = () => {
  // flatten source folders
  let sourceFoldersFlattened = sourceFolders
    .map(f => generateFileTree(f))
    .reduce((previous, current) => {
      let rslt = {};

      Object.keys(previous).forEach((fileType) => {
        rslt[fileType] = [...previous[fileType], ...current[fileType]];
      });

      return rslt;
    });

  // generate the file tree
  let fileTree = {};

  Object
    .keys(sourceFoldersFlattened)
    .forEach((fileType) => {
      fileTree[fileType] = [...sourceFiles[fileType], ...sourceFoldersFlattened[fileType]]
    });

  // init stats
  let stats = {};
  Object.keys(fileTree).forEach((fileType) => stats[fileType] = 0);

  // for each type of file
  Object.keys(fileTree).forEach((fileType) => {
    let filesPath = fileTree[fileType];

    // save split header here otherwise the split will happen
    // as many time as we call checkHeaderAndInjectIfNeeded function
    let headerSplit = headers[fileType].split('\n');

    filesPath.forEach(filePath => checkHeaderAndInjectIfNeeded(fileType, filePath, headerSplit, stats));
  });

  let headerOnEveryFile = Object.keys(stats).map(fileType => stats[fileType]).reduce((previous, current) => previous + current) === 0;

  // display stats
  Object.keys(stats).forEach(fileType =>
    console.log(`${args.dry && stats[fileType] > 0 ? '[ERROR] ': ''}${stats[fileType]} ${fileType} file${stats[fileType] > 1 ? 's' : ''} ${args.dry ? `don't have a header` : `updated`}`)
  );

  if (!headerOnEveryFile) {
    process.exit(1);
  }

  process.exit(0);
};

main();
