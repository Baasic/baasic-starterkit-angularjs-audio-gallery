(function(angular) {
    'use strict';

angular.module('media-gallery').filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);

}(angular));

