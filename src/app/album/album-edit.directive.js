(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('albumEdit', ['$parse',
        function albumList($parse) {

            return {
                restrict: 'AE',
                scope: true,
                replace: true,
                compile: function () {
                    return {
                        pre: function (scope, elem, attrs) {
                            if (attrs.onSave) {
                                scope.onSaveFn = $parse(attrs.onSave);
                            }

                            if (attrs.onCancel) {
                                scope.onCancelFn = $parse(attrs.onCancel);
                            }
                        }
                    };
                },
                controller: ['$scope', '$state', '$q', 'albumsService', 'baasicFilesService', '$sce','baasicUserProfileService',
                    function ($scope, $state, $q, albumsService, filesService, $sce, profileService) {

                        $scope.file = { filename: ''};
                        $scope.model = {};
                        $scope.artistId = $state.params.artistId;
                        $scope.albumId = $state.params.albumId;
                        var path = '/albumCover/' + $scope.albumId + '/albumCover.jpg';

                        if (!$scope.$root.user.isAuthenticated) {
                            $state.go('master.main.login');
                        }

                        function getAlbum() {
                            albumsService.get($state.params.albumId)
                                .success(function (album) {
                                    $scope.album = album;
                                })
                                .error(function (error) {
                                    console.log(error); // jshint ignore:line
                                })
                                .finally(function(){
                                });
                        }

                        getAlbum();

                        $scope.backToDetails = function backToDetails() {
                            $state.go('master.main.profile', {artistId : $scope.$root.user.id});
                        };


                        $scope.saveAlbum = function(album) {
                            var path;
                            var file;
                            if($scope.file.blob){
                                file = $scope.file.blob;
                                path = $scope.file.blob.name;
                            }
                            var saveCover = function() {
                                var promiseAlbumCover;
                                if(albumCover.value.length) {
                                    if($scope.album.coverId) {
                                        $scope.file = file;
                                        promiseAlbumCover = filesService.streams.update($scope.album.coverId, $scope.file);
                                    } else {
                                        promiseAlbumCover = filesService.streams.create(path, file);
                                    }

                                }
                                return promiseAlbumCover
                                    .success(function(cover){
                                        $scope.coverId = cover.id;
                                    })
                                    .error(function (error) {
                                        console.log(error);  // jshint ignore: line
                                    })
                                    .finally(function() {

                                    });

                            },
                            saveAlbum = function() {
                                var promiseAlbumData;
                                $scope.album.rnd = Math.random().toString().substr(2);
                                    if($scope.album.id === undefined) {
                                        $scope.album.artistId = $state.params.artistId;
                                        $scope.album.coverId = $scope.coverId;
                                        promiseAlbumData = albumsService.create($scope.album);
                                } else {
                                    if($scope.album.coverId) {
                                            $scope.coverId = $scope.album.coverId;
                                    }
                                    promiseAlbumData = albumsService.update($scope.album);
                                }
                                return promiseAlbumData
                                    .success(function(){
                                        if ($scope.onSaveFn) {
                                            $scope.onSaveFn($scope.$parent);
                                        }
                                    })
                                    .error(function (error) {
                                        $scope.error = error;
                                    })
                                    .finally(function () {
                                        getAlbum()
                                    });
                            },
                            getFilesData = function(){
                                filesService.get($scope.coverId)
                                    .success(function (data) {
                                        $scope.filesData = data;
                                        updateFilesData();
                                    })
                                    .error(function (error) {
                                        console.log(error)
                                    })
                                    .finally(function() {
                                    });
                            },
                            updateFilesData = function(){
                                if($scope.filesData){
                                    filesService.update($scope.filesData)
                                    .success(function (data) {
                                        $scope.data = data;
                                        $scope.backToDetails;
                                    })
                                    .error(function (error) {
                                        console.log(error)
                                    });
                                }

                            };

                            if($scope.file.blob) {
                                saveCover()
                                    .then(saveAlbum)
                                    .then(getFilesData)
                                    .then($scope.backToDetails);
                            } else {
                                saveAlbum()
                                    .then($scope.backToDetails);
                            }
                        };

                        $scope.cancel = function () {
                            $state.go('master.main.profile', {artistId: $scope.artistId}, {reload:true});
                        };


                        $scope.addSong = function () {
                            /*pseudo code
                            upload stream
                            add playlist entry
                            */
                        };

                        $scope.deleteSong = function () {
                            /*pseudo code
                            delete playlist entry
                            delete stream(file)
                            */
                        };

                        $scope.cancelEdit = function () {
                            $scope.backToDetails();
                        };
                    }

                ],
                templateUrl: 'templates/album/template-album-edit-form.html'
            };
        }
    ]);

}(angular));