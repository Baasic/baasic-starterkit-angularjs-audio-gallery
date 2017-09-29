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
                controller: ['$scope', '$state', '$q', 'albumsService', 'baasicFilesService', 'baasicApp', 'FileReader', '$timeout',
                    function ($scope, $state, $q, albumsService, filesService, baasicApp, FileReader, $timeout) {
                        var app = baasicApp.get();
                        $scope.apiUrl = app.getApiUrl();

                        $scope.albumId = $state.params.albumId;
                        $scope.file = {filename: '', blob: {}};
                        $scope.hasImageSelected = false;
                        $scope.invalidImageFileType = true;
                        $scope.imageInputChanged = false;
                        $scope.model = {};
                        $scope.songUrlList = [];
                        var file;
                        var path = $scope.albumId + '/albumCover.jpg';

                        //please login if not logged in
                        if (!$scope.$root.user.isAuthenticated) {
                            $state.go('master.main.login');
                        }

                        //back to profile page
                        $scope.backToDetails = function backToDetails() {
                            $state.go('master.main.profile', {artistId : $scope.$root.user.id});
                        };

                        $scope.$on('albumUpdated', function() {
                            getAlbum();
                        });



                        //get me album
                        function getAlbum() {
                            albumsService.get($scope.albumId)
                                .success(function (album) {
                                    $scope.album = album;
                                    if($scope.album.playlist) {
                                        if($scope.album.playlist.length) {
                                            $scope.songUrlList = [];
                                            for(var i = 0; i< $scope.album.playlist.length; i++){
                                                var url = $scope.album.playlist[i].url + '?rnd=' + $scope.album.rnd;
                                                $scope.songUrlList.push(url);
                                            }
                                        }
                                    }
                                })
                                .error(function (error) {
                                    console.log(error); //jshint ignore: line
                                })
                                .finally(function(){
                                });
                        }
                        getAlbum();

                        //update album cover
                        var updateCoverStream = function() {
                            file = $scope.file.blob;
                            var promise;

                            if($scope.album.coverId) {
                                promise = filesService.streams.update(path, file);
                            } else {
                                promise = filesService.streams.create(path, file);
                                $scope.album.rnd = Math.random(10).toString().substring(7);
                            }

                            return promise
                                .success(function() {
                                })
                                .error(function(error){
                                    console.log(error); //jshint ignore: line
                                })
                                .finally(function() {
                                    getCoverData();
                                });
                        };

                        //get me cover data
                        var getCoverData = function() {
                            filesService.find(path)
                                .success(function(coverData){
                                    $scope.coverData = coverData.item[0];
                                    if(!$scope.album.coverId) {
                                        $scope.album.coverId = $scope.coverData.id;
                                    }
                                })
                                .error(function(error) {
                                    console.log(error); //jshint ignore: line
                                })
                                .finally(function(){
                                    updateAlbum();
                                });
                        };

                        //update album data
                        var updateAlbum = function() {
                            return albumsService.update($scope.album)
                                .success(function(album){
                                    if(album){
                                        $scope.album = album;
                                    }
                                })
                                .error(function(error) {
                                    console.log(error); //jshint ignore: line
                                })
                                .finally(function() {
                                    loadAlbum();
                                });
                        };

                        //reload album
                        var loadAlbum = function() {
                            return albumsService.get($scope.album.id)
                                .success(function(){
                                })
                                .error(function(error){
                                    console.log(error); //jshint ignore: line
                                })
                                .finally(function(){
                                    $scope.backToDetails();
                                });
                        };

                        //find selected song in array
                        var findSong = function($index){
                            var songId = $scope.album.playlist[$index].id;
                            $scope.album.playlist.splice($index, 1);
                            return filesService.get(songId)
                                .success(function(songData) {
                                    $scope.songData = songData;
                                    $scope.songId = songData.id;
                                    removeSong();
                                })
                                .error(function(error) {
                                    console.log(error); //jshint ignore: line
                                })
                                .finally(function() {
                                    removeFromPlaylist();
                                });
                        };

                        //remove selected song from playlist
                        var removeFromPlaylist = function(){
                            return albumsService.update($scope.album)
                                .success(function(data){
                                    $scope.songData = data;
                                })
                                .error(function(error) {
                                    console.log(error); //jshint ignore: line
                                })
                                .finally(function(){
                                    getAlbum();
                                });
                        };

                        //remove selected song from system
                        var removeSong = function(){
                            return filesService.remove($scope.songData)
                                .success(function(){
                                })
                                .error(function(error) {
                                    console.log(error); //jshint ignore: line
                                })
                                .finally(function(){
                                });
                        };

                        //save album on button click
                        $scope.saveAlbum = function(saveAlbum) {
                            $scope.album = saveAlbum;
                            $scope.album.rnd = Math.random(10).toString().substring(7);

                            if($scope.hasImageSelected && !$scope.invalidImageFileType) {
                                updateCoverStream();
                            } else {
                                updateAlbum();
                            }
                        };

                        //delete song on button click
                        $scope.deleteSong = function ($index) {
                            findSong($index);
                        };

                        $scope.cancelEdit = function () {
                            $scope.backToDetails();
                        };

                        $scope.previewSelectedImage = function previewSelectedImage() {
                            $timeout(function() {
                                $scope.imageInputChanged = true;
                                if($scope.file.blob.type === 'image/png' || $scope.file.blob.type === 'image/jpeg' || $scope.file.blob.type === 'image/jpg' ) {
                                    $scope.invalidImageFileType = false;
                                    $scope.hasImageSelected = true;
                                    FileReader.readAsDataURL($scope.file.blob, $scope)
                                    .then(function(response){
                                        $scope.selectedImage = response;
                                    }, function(error) {
                                        $scope.error = error;
                                    });
                                }
                                else {
                                    $scope.invalidImageFileType = true;
                                }
                            });
                        };
                    }
                ],
                templateUrl: 'templates/album/template-album-edit-form.html'
            };
        }
    ]);
}(angular));
