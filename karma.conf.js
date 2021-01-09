// Karma configuration for Unit testing

const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const dotenv = require('dotenv');

const config = dotenv.config()
if (config.error) {
  console.error(config.error.toString());
}
const TEST_SERVER_PORT = process.env.TEST_SERVER_PORT || 9876;

module.exports = function (config) {

  const configuration = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-webpack'),
      require('karma-sourcemap-loader'),
      require('karma-spec-reporter')
    ],

    // list of files / patterns to load in the browser
    files: [
      'tests/miscellaneous/styles.css',
      { pattern: './tests/_index.js', watched: false }
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      './tests/_index.js': ['webpack', 'sourcemap']
    },

    // webpack
    webpack: {
      mode: 'development',
      resolve: {
        extensions: ['.ts', '.js']
      },
      module: {
        rules: [
          {
            test: /\.ts/,
            use: [
              { loader: 'ts-loader' },
              { loader: 'angular2-template-loader' },
              { loader: 'source-map-loader' }
            ],
            exclude: /node_modules/
          },
          {
            test: /\.html$/,
            use: 'raw-loader'
          },
          {
            test: /\.css$/,
            use: [
              { loader: 'to-string-loader' },
              { loader: 'css-loader' }]
          },
          {
            test: /\.scss$/,
            use: [
              { loader: 'raw-loader' },
              { loader: 'sass-loader' }
            ]
          }
        ],
        exprContextCritical: false
      },
      devtool: 'inline-source-map',
      performance: { hints: false },
      /* Workaround for https://github.com/angular/angular/issues/21560 */
      plugins: [
        new FilterWarningsPlugin({
          exclude: /System.import/
        })
      ]
    },

    webpackServer: {
      noInfo: true
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec'],

    port: TEST_SERVER_PORT,
    colors: true,
    logLevel: config.LOG_ERROR,
    autoWatch: !process.env.TRAVIS,
    browsers: process.env.TRAVIS ?
      ['Firefox'] :
      [process.platform === 'linux' ? 'Chromium' : 'Chrome'],
    singleRun: !!process.env.TRAVIS

  };

  config.set(configuration);

};
