describe('ngMidwayTester', function() {

  var tester,
      noop = angular.noop,
      appName = 'MyMod';

  afterEach(function() {
    tester.destroy();
    tester = null;
  });

  it('should register a module', function() {
    var example = angular.module(appName, [])
      .run(function($rootScope) {
        $rootScope.value = 'true';
      });

    tester = ngMidwayTester(appName);
    expect(tester.rootScope().value).to.equal('true');
  });

  describe('routing', function() {
    it('should change the path', function(done) {
      var example = angular.module(appName, ['ngRoute'])
        .run(function($rootScope) {
          $rootScope.value = 'true';
        });

      tester = ngMidwayTester(appName, true);
      tester.visit('/', function() {
        expect(tester.path()).to.equal('/');
        done();
      });
    });

    it('should update the when by the time the callback is called', function(done) {
      var example = angular.module(appName, ['ngRoute'])
        .config(function($routeProvider) {
          $routeProvider.when('/path', {
            controller: function($scope) {
              $scope.page = 'one'; 
            },
            template : '...'
          });
          $routeProvider.when('/path2', {
            controller: function($scope) {
              $scope.page = 'two'; 
            },
            template : '==='
          });
        });

      tester = ngMidwayTester(appName, true);
      tester.attach();

      tester.visit('/path', function() {
        expect(tester.path()).to.equal('/path');
        expect(tester.rootElement().text()).to.equal('...');
        expect(tester.viewScope().page).to.equal('one');

        tester.visit('/path2', function() {
          expect(tester.path()).to.equal('/path2');
          expect(tester.rootElement().text()).to.equal('===');
          expect(tester.viewScope().page).to.equal('two');

          done();
        });
      });
    });
  });

  describe('controllers', function() {
    var example, newScope;

    beforeEach(function() {
      example = angular.module(appName, [])
        .factory('factory', function() {
          return function() {
            return 'hello';
          }
        })
        .controller('HomeCtrl', function($scope, factory) {
          $scope.factory = factory;
        });

      tester = ngMidwayTester(appName, true);
      newScope = tester.rootScope().$new();
    });

    it('should execute the controller without having to provide any locals other than the scope', function() {
      tester.controller('HomeCtrl', {
        $scope : newScope
      });
      expect(newScope.factory()).to.equal('hello');
    });

    it('should allow for mocking of other services too', function() {
      tester.controller('HomeCtrl', {
        $scope : newScope,
        factory : function() {
          return 'jello';
        }
      });
      expect(newScope.factory()).to.equal('jello');
    });
  });

});
