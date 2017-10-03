(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('loader', [
        function loader() {

            var delay = 300,
                hideClass = 'ng-hide';

            return {
                restrict: 'A',
                scope: true,
                link: function (scope, elem, attrs) {
                    var name;

                    elem.addClass(hideClass);

                    if (attrs.loader) {
                        name = attrs.loader;
                    } else {
                        name = loader;
                    }

                    scope.$root[name] = {
                        suspend: function suspend() {
                            console.log('suspend');
                            scope.timerId = setTimeout(function () {
                                elem.removeClass(hideClass);
                            }, delay);
                        },
                        resume: function resume() {
                            console.log('resume');
                            if (scope.timerId) {
                                clearTimeout(scope.timerId);
                                scope.timerId = null;
                            }
                            elem.addClass(hideClass);
                        }
                    };
                }
            };
        }
    ]);

}(angular));