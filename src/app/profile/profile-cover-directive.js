angular.module('media-gallery')
    .directive('profileCover', [
        function () {
            'use strict';
            return {
                restrict: 'E',
                scope: '=',
                controller: ['$scope', '$state', 'baasicFilesService', 'baasicUserProfileService',
                    function ($scope, $state, filesService, profileService) {
                        $scope.file = { filename: ''};
                        $scope.model = {};
                        $scope.artistId = $state.params.artistId;
                        var path = $scope.artistId + '/profileCover.jpg';
                        function getProfile() {
                            return profileService.get($scope.artistId, {
                            })
                                .success(function(profile){
                                    $scope.profile = profile;
                                    $scope.profile.coverPathOld = profile.coverPath;
                                    if ($scope.profile.coverPath) {
                                        $scope.profile.coverPath = path;
                                    }
                                });
                        }

                        $scope.cancel = function () {
                            $state.go('master.main.profile', {artistId: $scope.artistId}, {reload:true});
                        };

                        $scope.saveCover = function () {
                            if(editProfile.profileCover.value.length) {
                                $scope.$root.loader.suspend();
                                var file = $scope.file.blob;
                                var addCover = function(path, file) {
                                    return filesService.streams.create(path, file)
                                        .success(function(fileData) {
                                            angular.extend($scope.model, fileData);
                                            $scope.fileData = fileData;
                                        });
                                    },
                                    updateCover = function(path, file) {
                                    return filesService.streams.update(path, file)
                                        .success(function(fileData) {
                                            angular.extend($scope.model, fileData);
                                            $scope.fileData = fileData;
                                        });
                                    },
                                    updateProfile = function() {
                                        $scope.profile.coverPath = path;
                                        return profileService.update($scope.profile)
                                        .success (function(data){
                                            console.log(data);
                                            $scope.$root.loader.resume();
                                        });
                                    };

                                    getProfile();
                                    if($scope.profile.coverPath) {
                                    updateCover(path, file)
                                            .then(updateProfile());
                                    } else {
                                    addCover(path, file)
                                        .then(updateProfile());
                                    }
                            }
                        };
                    }
                ],
                templateUrl: 'templates/profile/profile-cover-template.html'
            };
        }
    ]);