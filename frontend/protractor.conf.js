// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const initConfig = () => {
  return {
    allScriptsTimeout: 30000,
    capabilities: {
      browserName: 'chrome',
      chromeOptions: {
        useAutomationExtension: false,
        args: ['--no-sandbox', '--headless', '--disable-gpu'],
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
