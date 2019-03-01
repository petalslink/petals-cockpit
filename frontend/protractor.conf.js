/**
 * Copyright (C) 2017-2019 Linagora
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
 */

// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const initConfig = () => {
  return {
    allScriptsTimeout: 30000,
    capabilities: {
      browserName: 'chrome',
      chromeOptions: {
        useAutomationExtension: false,
        args: [
          '--no-sandbox',
          '--headless',
          '--disable-gpu',
          '--disable-extensions',
          '--disable-dev-shm-usage',
        ],
      },
    },
    directConnect: true,
    baseUrl: 'http://localhost:4200/',
    framework: 'jasmine',
    jasmineNodeOpts: {
      showColors: true,
      defaultTimeoutInterval: 90000,
      print: function() {},
    },
  };
};

module.exports = {
  initConfig,
};
