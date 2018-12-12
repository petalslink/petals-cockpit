const path = require('path');
const fs = require('fs');
const readline = require('readline');

const currentYear = '2018';

// folders
const sourceFolders = [
  './src/app',
  './src/styles',
  './src/mocks',
  './e2e',
  './cypress'
];

// individual files
const sourceFiles = {
  ts: [
    './src/main.ts'
  ],

  scss: [
    './src/styles.scss'
  ],

  html: []
};

const headerRegex = new RegExp('(Copyright \\(C\\) )(\\d\\d\\d\\d)(-\\d\\d\\d\\d)?( Linagora)');

const headers = [
  {ts: null},
  {scss: null},
  {html: null}
];

headers.ts =
`/**
 * Copyright (C) ${currentYear} Linagora
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
`<!-- Copyright (C) ${currentYear} Linagora

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
const checkHeaderAndInjectIfNeeded = (fileType, filePath, header, stats) => {
  let file = fs.readFileSync(filePath).toString();
  let noHeader = true;
  let fileChanged = file.replace(headerRegex, (match, p1, p2, p3, p4, offset, string) => {
    let headerStart = p1, firstYear = p2, secondYear = p3, headerEnd = p4;
    let date = currentYear;

    noHeader = false;

    if (secondYear) {
      date = `${firstYear}-${currentYear}`;
    } else if (firstYear !== currentYear) {
      date = `${firstYear}-${currentYear}`;
    }

    return `${headerStart}${date}${headerEnd}`;
  })

  if (noHeader) {
    fileChanged = `${header}\n\n${file}`;
  } else {
    if (file === fileChanged) {
      return;
    }
  }

  stats[fileType]++;

  if (!args.dry) {
    fs.writeFileSync(filePath, fileChanged);
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
    let header = headers[fileType];

    filesPath.forEach(filePath => checkHeaderAndInjectIfNeeded(fileType, filePath, header, stats));
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
