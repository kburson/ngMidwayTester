var ngMidwayTester = function(moduleName, useNgView, doc, wind) {

  doc = doc || document;
  wind = wind || window;
  var  noop = angular.noop;

  var $rootElement = angular.element((doc).createElement('div')),
      $cache = {},
      $timers = [],
      $viewContainer,
      $injector,
      $terminalElement,
      $viewCounter = 0;

  angular.module('ngMidway', [])
    .run(function(_$injector_) {
      $injector = _$injector_;
    });

  if(useNgView) {
    $viewContainer = angular.element('<div><div ng-view></div></div>');
    $rootElement.append($viewContainer);

    $terminalElement = angular.element('<div status="{{status}}"></div>');
    $rootElement.append($terminalElement);
  }

  angular.bootstrap($rootElement, ['ng','ngMidway',moduleName]);
  var $rootModule = angular.module(moduleName);

  return {
    module : function() {
      return $rootModule;
    },

    attach : function(body) {
      angular.element(body || doc.body).append($rootElement);
    },

    controller : function(name, locals) {
      this.inject('$controller')(name, locals);
    },

    rootScope : function() {
      return this.inject('$rootScope');
    },

    rootElement : function() {
      return $rootElement;
    },

    viewElement : function() {
      var kids = $viewContainer.children();
      return angular.element(kids[kids.length-1]);
    },

    viewScope : function() {
      return this.viewElement().scope();
    },

    evalAsync : function(fn, scope) {
      (scope || this.rootScope()).$evalAsync(fn);
    },

    directive : function(html, scope, callback) {
      return this.compile(html, scope);
    },

    compile : function(html, scope) {
      return this.inject('$compile')(html)(scope || this.rootScope());
    },

    digest : function(scope) {
      (scope || this.rootScope()).$digest();
    },

    apply : function(fn, scope) {
      scope = scope || this.inject('$rootScope');
      scope.$$phase ? fn() : scope.$apply(fn);
    },

    inject : function(item) {
      return $cache[item] || ($cache[item] = $injector.get(item));
    },

    injector : function(item) {
      return $injector;
    },

    path : function() {
      return this.inject('$location').path();
    },

    visit : function(path, callback) {
      this.rootScope().status = ++$viewCounter;
      this.until(function() {
        return parseInt($terminalElement.attr('status')) >= $viewCounter;
      }, callback || noop);

      var $location = this.inject('$location');
      this.apply(function() {
        $location.path(path);
      });
    },

    until : function(exp, callback) {
      var timer, delay = 50;
      timer = setInterval(function() {
        if(exp()) {
          clearTimeout(timer);
          callback();
        }
      }, delay); 
      $timers.push(timer);
    },

    destroy : function() {
      this.visit('/');
      angular.forEach($timers, function(timer) {
        clearTimeout(timer);
      });
      wind.location.hash = '';
      this.rootElement().remove();
    }
  };
};
