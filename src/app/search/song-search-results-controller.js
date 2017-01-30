(function(angular) {
    'use strict';

angular.module('media-gallery')
    .controller('SongSearchResultsCtrl', ['$scope', '$state', 'baasicFilesService',
        function ($scope, $state, baasicFilesService) {


            function parseCollection(collection) {
                $scope.pagerData = {
                    currentPage: collection.page,
                    pageSize: collection.recordsPerPage,
                    totalRecords: collection.totalRecords
                };

                $scope.collection = collection;

                $scope.hasPhotos = collection.totalRecords > 0;
            }

            $scope.hasSongs = false;

            var options = {
                rpp: 10
            };

            if ($state.params.search || $state.params.type) {
                var folderPath = '';
                switch ($state.params.type.toLowerCase()) {
                    case 'cities-and-villages':
                        folderPath = '/' + 'Cities and Villages' + '/';
                        break;
                    default:
                        folderPath = '/' + $state.params.type + '/';
                        break;
                }
                options.search = folderPath + ($state.params.search || '');
            }

            baasicFilesService.find(options)
                .success(parseCollection)
                .error(function (error) {
                    conosle.log(error); // jshint ignore: line
                });

            $scope.prevPage = function prevPage() {
                baasicFilesService.previous($scope.collection)
                    .success(parseCollection)
                    .error(function (error) {
                        conosle.log(error); // jshint ignore: line
                    });
            };

            $scope.nextPage = function nextPage() {
                baasicFilesService.next($scope.collection)
                    .success(parseCollection)
                    .error(function (error) {
                        conosle.log(error); // jshint ignore: line
                    });
            };
        }
    ]);

}(angular));