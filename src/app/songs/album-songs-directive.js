(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('albumSongs', [
        function () {
            return {
                restrict: 'E',
                scope: '=',
                controller: ['$scope', '$state', 'baasicFilesService', 'albumsService',
                    function ($scope, $state, filesService, albumsService) {
                        $scope.file = { filename: ''};
                        $scope.model = {};
                        $scope.albumId = $state.params.albumId;
                        var path = $scope.albumId + ' / ' + $scope.file.blob.name;

                        function getAlbum() {
                            return albumsService.get($scope.albumId, {
                            })
                                .success(function(album){
                                    $scope.album = album;

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
                                            $scope.updatedProfile = data;
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
                templateUrl: 'templates/album/template-album-songs-add.html'
            };
        }
    ]);
}(angular));