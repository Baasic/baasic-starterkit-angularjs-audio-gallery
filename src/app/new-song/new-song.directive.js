// /* global google */
angular.module('media-gallery')
    .directive('newSong', [
        function () {
            'use strict';
            return {
                restrict: 'E',
                scope: true,
                controller: ['$scope', '$state', '$rootScope','baasicFilesService',
                    function ($scope, $state, $rootScope, baasicFilesService) {
                        $scope.file = { fileName: '' };
                        $scope.model = {};

                        $scope.cancel = function () {
                            $state.go('master.main.index');
                        };

                        $scope.save = function () {
                            if ($scope.newSong.$valid) {
                                $scope.$root.loader.suspend();
                                var path = $rootScope.user.userName + '/' + $scope.model.album + '/' + $scope.file.blob.name;
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
                templateUrl: 'templates/new-song/template-new-song.html'
            };
        }
    ]);