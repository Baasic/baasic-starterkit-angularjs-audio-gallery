angular.module('media-gallery')
    .directive('albumCover', [
        function () {
            'use strict';
            return {
                restrict: 'AE',
                scope: true,
                controller: ['$scope', '$state', 'baasicFilesService',
                    function ($scope, baasicFilesService) {
                        $scope.file = { fileName: '' };
                        $scope.model = {};

                        $scope.cancel = function () {
                            $state.go('master.main.index');
                        };

                        $scope.save = function () {
                            if ($scope.album.$valid) {
                                $scope.$root.loader.suspend();
                                var path = $scope.album.name + '/cover/' + $scope.file.blob.name;
                                baasicFilesService.streams.create(path, $scope.file.blob)
                                    .success(function (fileData) {
                                        angular.extend($scope.model, fileData);
                                        baasicFilesService.batch.update([$scope.model])
                                            .success(function () {
                                                $scope.$root.loader.resume();
                                                $state.go('master.main.index');
                                            })
                                            .error(function (error) {
                                                $scope.error = error.message;
                                                $scope.$root.loader.resume();
                                            });
                                    })
                                    .error(function (error) {
                                        $scope.error = error.message;
                                        $scope.$root.loader.resume();
                                    });
                            }
                        };
                    }
                ],
               templateUrl: 'templates/album/template-album-cover.html'
            };
        }
    ]);