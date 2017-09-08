(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('albumSongs', [
        function () {
            return {
                restrict: 'E',
                scope: '=',
                controller: ['$scope', '$state', 'baasicFilesService', 'albumsService','baasicUserProfileService',
                    function ($scope, $state, filesService, albumsService, profileService) {
                        $scope.file = { filename: ''};
                        $scope.model = {};
                        $scope.albumId = $state.params.albumId;

                        $scope.addSong = function(song) {
                            $scope.songTitle = song.title;
                            if($scope.file) {
                                var file = $scope.file.blob;
                                var path = $scope.albumId + '/' + $scope.file.blob.name;
                            }

                            function getAlbum() {
                                albumsService.get($scope.albumId, {})
                                .success(function(album){
                                    $scope.album = album;
                                    if($scope.album.playlist) {
                                        $scope.playlist = album.playlist;
                                    } else {
                                        $scope.album.playlist = [];
                                    }
                                    $scope.artistId = $scope.album.artistId;
                                })
                                .error(function(error){
                                    console.log(error); //jshint ignore: line
                                })
                                .finally(function(){
                                    getArtist();
                                });
                            }

                            var getArtist = function(){
                                profileService.get($scope.artistId)
                                .success(function(artist){
                                    $scope.artistName = artist.displayName;
                                })
                                .error(function(error){
                                    console.log(error); //jshint ignore: line
                                })
                                .finally(function(){
                                    uploadSong();
                                });
                            };

                            var uploadSong = function(){
                                console.log('upload song'); //jshint ignore: line
                                
                                filesService.streams.create(path, file)
                                .success(function(){
                                })
                                .error(function(error){
                                    console.log(error); //jshint ignore: line
                                })
                                .finally(function(){
                                    getSongData();
                                });
                                
                            };

                            var getSongData = function(){
                                return filesService.find(path)
                                    .success(function(songData){
                                        $scope.song = songData.item[0];
                                        $scope.song.artist = $scope.artistName;
                                        $scope.song.title = $scope.songTitle;
                                        //TODO: hard coded path
                                        $scope.song.cover = 'https://api.baasic.com/v1/bmsk-audio/file-streams/' + $scope.album.coverId;
                                        $scope.song.url = 'https://api.baasic.com/v1/bmsk-audio/file-streams/' + $scope.song.id;
                                    })
                                    .error(function(error){
                                        console.log(error); //jshint ignore: line
                                    })
                                    .finally(function(){
                                        $scope.album.playlist.push($scope.song);
                                        updateAlbum();
                                    });
                            };

                            var updateAlbum = function(){
                                return albumsService.update($scope.album)
                                    .success(function(){
                                    })
                                    .error(function(error){
                                        console.log(error); //jshint ignore: line
                                    })
                                    .finally(function(){
                                        refreshAlbum();
                                    });
                            };

                            var refreshAlbum = function(){
                                console.log('refreshing album'); //jshint ignore: line
                                return albumsService.get($scope.albumId, {
                                })
                                    .success(function(album){
                                        $scope.album = album;
                                    })
                                    .error(function(error){
                                        console.log(error); //jshint ignore: line
                                    })
                                    .finally(function(){
                                    });
                            };
                            
                            getAlbum();
                        };

                        $scope.editSong = function(song) {
                            $scope.songTitle = song.title;
                            if($scope.file) {
                                var file = $scope.file.blob;
                                var path = $scope.albumId + '/' + $scope.file.blob.name;
                            }
                            var getAlbum = function() {
                                return albumsService.get($scope.albumId, {
                                })
                                    .success(function(album){
                                        $scope.album = album;
                                        $scope.playlist = album.playlist;
                                        $scope.artistId = $scope.album.artistId;
                                    })
                                    .error(function(error){
                                        console.log(error); //jshint ignore: line
                                    })
                                    .finally(function(){
                                        getArtist();
                                    });
                            };
                            var getArtist = function(){
                                return profileService.get($scope.artistId)
                                    .success(function(artist){
                                        $scope.artistName = artist.displayName;
                                    })
                                    .error(function(error){
                                        console.log(error); //jshint ignore: line
                                    })
                                    .finally(function(){
                                        uploadSong();
                                    });
                            };
                            var uploadSong = function(){
                                return filesService.streams.update(path, file)
                                    .success(function(){
                                    })
                                    .error(function(error){
                                        console.log(error);  //jshint ignore: line
                                    })
                                    .finally(function(){
                                        getSongData();
                                    });
                            };
                            var getSongData = function(){
                                return filesService.find(path)
                                    .success(function(songData){
                                        $scope.song = songData.item[0];
                                        $scope.song.artist = $scope.artistName;
                                        $scope.song.title = $scope.songTitle;
                                        $scope.song.pic = $scope.album.coverId;
                                        //TODO: hard coded path
                                        $scope.song.url = 'https://api.baasic.com/v1/bmsk-audio/file-streams/'+ $scope.song.id;
                                    })
                                    .error(function(error){
                                        console.log(error);  //jshint ignore: line
                                    })
                                    .finally(function(){
                                        updateAlbum();
                                    });
                            };
                            var updateAlbum = function(){
                                return albumsService.update($scope.album)
                                    .success(function(){
                                    })
                                    .error(function(error){
                                        console.log(error);  //jshint ignore: line
                                    })
                                    .finally(function(){
                                        refreshAlbum();
                                    });
                            };
                            var refreshAlbum = function(){
                                return albumsService.get($scope.albumId, {
                                })
                                    .success(function(album){
                                        $scope.album = album;
                                    })
                                    .error(function(error){
                                        console.log(error); //jshint ignore: line
                                    })
                                    .finally(function(){
                                    });
                            };
                            getAlbum();
                        };

                        $scope.cancel = function() {
                            $state.go('master.main.profile', {artistId: $scope.artistId}, {reload:true});
                        };
                    }
                ],
                templateUrl: 'templates/album/template-album-songs-add.html'
            };
        }
    ]);
}(angular));
