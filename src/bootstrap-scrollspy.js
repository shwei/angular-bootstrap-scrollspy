'use strict';

angular.module('mgcrea.bootstrap.scrollspy', ['mgcrea.jquery'])

  .directive('bsScrollspy', function($window, $location, $routeParams, jQuery, debounce) {

    var slice = Array.prototype.slice;

    var offset;
    var offsets = [];
    var targets = [];
    var activeTarget;

    var refresh = function(options) {
      offsets = [];
      targets = [];
      slice.call(jQuery(options.target).children())
        .map(function(el) {
          return [jQuery(el).offset().top, el.id];
        })
        .sort(function(a, b) {
          return a[0] - b[0];
        })
        .forEach(function(el) {
          offsets.push(el[0]);
          targets.push(el[1]);
        });

      if(options.offset) {
        offset = options.offset === 'auto' ? offsets.length && offsets[0] : options.offset * 1;
      }
    };

    var process = function(scope, el, options) {
      if(!offsets.length) return;
      var scrollTop = el[0].scrollTop + offset;
      var scrollHeight = el[0].scrollHeight || document.body.scrollHeight;
      // var maxScroll = scrollHeight - jqHeight(el[0]);

      if(scrollTop < offsets[0] && activeTarget !== targets[0]) {
        return activate(scope, targets[0], options);
      }
      // if(scrollTop > maxScroll) {
      //   // return activate(scope, targets[0]);
      // }
      for (var i = offsets.length; i--;) {
        if(activeTarget !== targets[i] && scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1])) {
          activate(scope, targets[i], options);
        }
      }
    };

    var activate = function(scope, selector, options) {

      // Save active target for process()
      activeTarget = selector;

      // Toggle active class on elements
      jQuery(options.target + ' > .active').removeClass('active');
      jQuery('#' + activeTarget).addClass('active');

      // Use $location.search to trigger dom changes
      scope.$apply($location.search(options.search || 'page', selector));

    };

    return {
      restrict: 'EAC',
      link: function postLink(scope, iElement, iAttrs) {

        var refreshPositions = function() {
          refresh(iAttrs);
          process(scope, iElement, iAttrs);
        };
        var debouncedRefresh = debounce(refreshPositions, 300);

        scope.$on('$viewContentLoaded', debouncedRefresh);
        scope.$on('$includeContentLoaded', debouncedRefresh);

        angular.element($window).bind('scroll', function() {
          process(scope, iElement, iAttrs);
        });

      }
    };

  });