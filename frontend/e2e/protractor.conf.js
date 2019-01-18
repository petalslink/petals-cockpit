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

const { SpecReporter } = require('jasmine-spec-reporter');
const conf = require('../protractor.conf.js');

const defaultConfig = conf.initConfig();

const e2eConfig = {
  specs: ['./*.e2e-spec.ts'],
  extends: '../../protractor.conf.js',
  onPrepare() {
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json',
    });
    jasmine
      .getEnv()
      .addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  },
};

module.exports.config = Object.assign(defaultConfig, e2eConfig);
