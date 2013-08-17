module.exports = function(config) {
  config.set({
    files : [
      '../node_modules/chai/chai.js',
      '../bower_components/angularjs/index.js',
      '../bower_components/angularjs-route/index.js',
      '../src/ngMidwayTester.js',
      './lib/chai.js',
      './ngMidwayTesterSpec.js'
    ],
    singleRun: true,
    frameworks: ['mocha'],
    browsers: ['Chrome']
  });
};
