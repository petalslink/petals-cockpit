var wallabyWebpack = require('wallaby-webpack');
var path = require('path');

var compilerOptions = Object.assign(
  {},
  require('./tsconfig.json').compilerOptions,
  require('./src/tsconfig.spec.json').compilerOptions
);

module.exports = function (wallaby) {
  return {
    files: [
      { pattern: 'src/**/*.ts', load: false },
      { pattern: 'src/**/*.d.ts', ignore: true },
      { pattern: 'src/**/*.css', load: false },
      { pattern: 'src/**/*.less', load: false },
      { pattern: 'src/**/*.scss', load: false },
      { pattern: 'src/**/*.sass', load: false },
      { pattern: 'src/**/*.styl', load: false },
      { pattern: 'src/**/*.html', load: false },
      { pattern: 'src/**/*.json', load: false },
      { pattern: 'src/**/*.spec.ts', ignore: true }
    ],

    tests: [
      { pattern: 'src/**/*.spec.ts', load: false }
    ],

    testFramework: 'jasmine',

    compilers: {
      '**/*.ts': wallaby.compilers.typeScript(compilerOptions)
    },

    env: {
      kind: 'electron'
    },

    postprocessor: wallabyWebpack({
      // webpack will already have converted the ts into js files
      entryPatterns: [
        'src/wallabyTest.js',
        'src/**/*.spec.js'
      ],

      module: {
        loaders: [
          { test: /\.css$/, loader: 'raw-loader' },
          { test: /\.html$/, loader: 'raw-loader' },
          { test: /\.js$/, loader: 'angular2-template-loader', exclude: /node_modules/ },
          { test: /\.json$/, loader: 'json-loader' },
          { test: /\.styl$/, loaders: ['raw-loader', 'stylus-loader'] },
          { test: /\.less$/, loaders: ['raw-loader', 'less-loader'] },
          { test: /\.scss$|\.sass$/, loaders: ['raw-loader', 'sass-loader'] },
          { test: /\.(jpg|png)$/, loader: 'url-loader?limit=128000' }
        ]
      },

      resolve: {
        modules: [
          // needed for absolute path imports
          path.join(wallaby.projectCacheDir, 'src')
        ]
      }
    }),

    setup: function () {
      window.__moduleBundler.loadTests();
    },

    debug: true
  };
};
