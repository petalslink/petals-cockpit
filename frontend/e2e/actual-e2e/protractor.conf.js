const { SpecReporter } = require('jasmine-spec-reporter');
const conf = require('../../protractor.conf.js');

const defaultConfig = conf.initConfig();

const actualConfig = {
  specs: ['./*.e2e-spec.ts'],
  onPrepare() {
    require('ts-node').register({
      project: 'e2e/actual-e2e/tsconfig.e2e.json',
    });
    jasmine
      .getEnv()
      .addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  },
};

module.exports.config = Object.assign(defaultConfig, actualConfig);
