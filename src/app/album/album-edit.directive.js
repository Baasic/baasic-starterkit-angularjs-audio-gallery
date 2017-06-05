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
                        $scope.artistId = $state.params.artistId;
                        $scope.albumId = $state.params.albumId;
                        var file;
                        var path;



                        //please loginif not logged in
                        if (!$scope.$root.user.isAuthenticated) {
                            $state.go('master.main.login');
                        }

                        //get me selected album
                        function getAlbum() {
                            if($state.params.albumId) {
                                albumsService.get($state.params.albumId)
                                    .success(function (album) {
                                        $scope.album = album;
                                    })
                                    .error(function (error) {
                                        console.log(error); // jshint ignore:line
                                    })
                                    .finally(function(){
                                    });
                            } else {
                                $scope.album = {};
                            }
                        }

                        getAlbum();

                        $scope.backToDetails = function backToDetails() {
                            $state.go('master.main.profile', {artistId : $scope.$root.user.id});
                        };


                        $scope.saveAlbum = function(saveAlbum) {
                            $scope.album = saveAlbum;

                            var saveCover = function() {
                                var promiseAlbumCover;
                                if($scope.file.blob) {
                                    if($scope.album.coverId) {
                                        $scope.file = file;
                                        promiseAlbumCover = filesService.streams.update($scope.album.coverId, $scope.file);
                                    } else {
                                        promiseAlbumCover = filesService.streams.create(path, file);
                                    }
                                }
                                return promiseAlbumCover
                                    .success(function(){

                                    })
                                    .error(function (error) {
                                        console.log(error);  // jshint ignore: line
                                    })
                                    .finally(function() {

                                    });

                            };
                            var editAlbum = function() {
                                var promiseAlbumData;

                                if($scope.album.id === undefined) {
                                        $scope.album.artistId = $state.params.artistId;
                                        $scope.album.coverId = $scope.coverId;
                                        $scope.album.rnd = Math.random().toString().substr(2);
                                        promiseAlbumData = albumsService.create($scope.album);
                                } else {
                                    if($scope.album.coverId) {
                                            $scope.album.rnd = Math.random().toString().substr(2);
                                    }
                                    promiseAlbumData = albumsService.update($scope.album);
                                }
                                return promiseAlbumData
                                    .success(function(album){
                                        $scope.album = album;
                                        if ($scope.onSaveFn) {
                                            $scope.onSaveFn($scope.$parent);
                                        }
                                    })
                                    .error(function (error) {
                                        $scope.error = error;
                                    })
                                    .finally(function () {
                                        getAlbum();
                                    });
                            };
                            var getFilesData = function(){
                                return filesService.find({
                                    search: path
                                })
                                    .success(function (albumCover) {
                                        $scope.filesData = albumCover.item[0];
                                    })
                                    .error(function (error) {
                                        console.log(error); //jshint ignore: line
                                    })
                                    .finally(function() {
                                    });
                            };
                            var updateFilesData = function(){
                                if($scope.filesData){
                                    return filesService.update($scope.filesData)
                                        .success(function (data) {
                                            $scope.data = data;
                                        })
                                        .error(function (error) {
                                            console.log(error); //jshint ignore: line
                                        })
                                        .finally(function(){
                                            if($scope.filesData.id !== $scope.album.coverId) {
                                                $scope.album.coverId = $scope.filesData.id;
                                                editAlbum();
                                            }
                                        });
                                }

                            };
                            var isCover = function(){
                                if($scope.file.blob){
                                    file = $scope.file.blob;
                                    path = $scope.album.id + '/cover.jpg';
                                }
                            };

                            if($scope.file.blob) {
                                editAlbum()
                                    .then(isCover)
                                    .then(saveCover)
                                    .then(getFilesData)
                                    .then(updateFilesData)
                                    .then(getAlbum)
                                    .then($scope.backToDetails());
                                }
                                else {
                                editAlbum()
                                    .then(getAlbum)
                                    .then($scope.backToDetails());
                                }
                        };

                        $scope.cancel = function () {
                            $state.go('master.main.profile', {artistId: $scope.artistId}, {reload:true});
                        };

                        //this i'll do later
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
