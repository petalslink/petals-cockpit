/**
 * Copyright (C) 2018-2020 Linagora
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

// ***********************************************************
// This example plugins/index.ts can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// promisified fs module
const fs = require('fs-extra');
const path = require('path');
const cypressTypeScriptPreprocessor = require('./cy-ts-preprocessor');

function getConfigurationByFile(file) {
  const pathToConfigFile = path.resolve(
    'cypress',
    'config',
    `cypress.${file}.json`
  );

  return fs.readJson(pathToConfigFile);
}

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  on('file:preprocessor', cypressTypeScriptPreprocessor);

  // `config` is the resolved Cypress config
  const file = config.env.configFile || 'ldap';

  return getConfigurationByFile(file);
};
