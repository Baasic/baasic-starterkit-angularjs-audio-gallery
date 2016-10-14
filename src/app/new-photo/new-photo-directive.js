angular.module('media-gallery')
    .directive('newPhoto', [
        function () {
            'use strict';
            return {
                restrict: 'E',
                scope: true,
                controller: ['$scope', '$state', 'filesService', 'profileService',
                    function ($scope, $state, filesService, profileService) {
                        $scope.file = { fileName: '' };
                        $scope.model = {};
                        $scope.artistId = $state.params.artistId;

                        var api = 'api.baasic.com',
                            version = 'beta',
                            key = 'audiogallery';
                        $scope.appPath = 'http://' + api + '/' + version + '/' + key + '/file-streams/';


                        $scope.cancel = function () {
                            $state.go('master.main.index');
                        };

                        $scope.savePhoto = function () {
                            if ($scope.newPhoto.$valid) {
                                $scope.$root.loader.suspend();
                                var path = $scope.artistId + '/avatar/' + $scope.file.blob.name;
                                filesService.streamCreate(path, $scope.file.blob)
                                    .success(function (fileData) {
                                        angular.extend($scope.model, fileData);
                                        $scope.profile.avatar = $scope.appPath + fileData.id;

                                        filesService.batchUpdate([$scope.model])
                                            .success(function () {
                                                $scope.$root.loader.resume();
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
                templateUrl: 'templates/new-photo/template-new-photo.html'
            };
        }
    ]);