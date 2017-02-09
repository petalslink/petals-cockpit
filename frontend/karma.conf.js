// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular/cli'],
    plugins: [
      require('karma-jasmine'),
      require('karma-jasmine-diff-reporter'),
      require('karma-clear-screen-reporter'),
      require('karma-chrome-launcher'),
      require('karma-remap-istanbul'),
      require('@angular/cli/plugins/karma')
    ],
    files: [
      { pattern: './src/test.ts', watched: false }
    ],
    preprocessors: {
      './src/test.ts': ['@angular/cli']
    },
    mime: {
      'text/x-typescript': ['ts','tsx']
    },
    remapIstanbulReporter: {
      reports: {
        html: 'coverage',
        lcovonly: './coverage/coverage.lcov'
      }
    },
    angularCli: {
      config: './angular-cli.json',
      environment: 'dev'
    },
    reporters: config.angularCli && config.angularCli.codeCoverage
              ? ['jasmine-diff', 'progress', 'karma-remap-istanbul', 'clear-screen']
              : ['jasmine-diff', 'progress', 'clear-screen'],
    jasmineDiffReporter: {
      pretty: true
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromiumNoSandbox'],
    customLaunchers: {
      ChromiumNoSandbox: {
        base: 'Chromium',
        flags: ['--no-sandbox']
      }
    },
    failOnEmptyTestSuite: false,
    singleRun: false
  });
};
