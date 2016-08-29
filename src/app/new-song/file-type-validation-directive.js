angular.module('media-gallery')
    .directive('fileTypes', function () {
        'use strict';
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                var validTypes = attr.fileTypes.split('mp3');

                function validate(viewValue) {
                    var valid = viewValue ? validTypes.lastIndexOf(viewValue) === -1 : false;
                    ngModel.$setValidity('fileType', valid);
                    return viewValue;
                }

                element.bind('change', function () {
                    scope.$apply(function () {
                        ngModel.$setViewValue(element.val());
                    });
                });

                ngModel.$parsers.unshift(validate);
                ngModel.$formatters.unshift(validate);
            }
        };
    });