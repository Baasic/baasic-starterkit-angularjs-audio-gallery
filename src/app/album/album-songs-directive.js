(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('albumSongs', [
        function () {
            return {
                restrict: 'E',
                scope: '=',
                controller: ['$scope', '$rootScope', '$state', 'baasicFilesService', 'albumsService','baasicUserProfileService', 'baasicApp', '$timeout',
                    function ($scope, $rootScope, $state, filesService, albumsService, profileService, baasicApp, $timeout ) {
                        $scope.file = { filename: ''};
                        $scope.model = {};
                        $scope.albumId = $state.params.albumId;
                        $scope.invalidAudioFileType = false;
                        var app = baasicApp.get();
                        $scope.apiUrl = app.getApiUrl();

                        $scope.updateFileArray = [];

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
                                    $scope.error = error;
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
                                    $scope.error = error;
                                })
                                .finally(function(){
                                    uploadSong();
                                });
                            };

                            var uploadSong = function(){
                                
                                filesService.streams.create(path, file)
                                .success(function(){
                                })
                                .error(function(error){
                                    $scope.error = error;
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
                                        $scope.song.cover = $scope.apiUrl + '/file-streams/' + $scope.album.coverId;
                                        $scope.song.url = $scope.apiUrl + '/file-streams/' + $scope.song.id;
                                    })
                                    .error(function(error){
                                        $scope.error = error;
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
                                        $scope.error = error;
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
                                        $scope.error = error;
                                    })
                                    .finally(function(){
                                        //TODO: set the new song form input to pristine state.
                                        //this is a temporary hack
                                        document.getElementById('newSongTitle').value = null;
                                        document.getElementById('newSongFile').value = null;
                                        $scope.newSong.$setPristine();
                                    });
                            };
                            if(!$scope.invalidAudioFileType){
                                getAlbum();
                            }
                        };

                        $scope.checkUpdateFileType = function(index) {
                            $timeout(function() {
                                if($scope.updateFileArray[index].file.blob.type === 'audio/mp3' || $scope.updateFileArray[index].file.blob.type === 'audio/m4a') {
                                    $scope.updateFileArray[index].invalid = false;
                                } else {
                                    $scope.updateFileArray[index].invalid = true;
                                }
                            });                            
                        }

                        /*
                        $scope.saveEditedSong = function(song) {
                            $scope.songTitle = song.title;
                            var file = {};
                            var oldPath = song.path;
                            var title = '';

                            var index = $scope.album.playlist.indexOf(song);
                            var obj = $scope.updateFileArray[index];

                            if(obj.file) {
                                console.log(obj.file);
                                file = obj.file.blob;
                            }
                            if(obj.title !== song.title) {
                                title = obj.title;
                            }

                            var getAlbum = function() {
                                return albumsService.get($scope.albumId, {})
                                    .success(function(album){
                                        $scope.album = album;
                                        $scope.playlist = album.playlist;
                                        $scope.artistId = $scope.album.artistId;
                                    })
                                    .error(function(error){
                                        $scope.error = error;
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
                                        $scope.error = error;
                                    })
                                    .finally(function(){
                                        if(file.type){
                                            updateSong();
                                        }
                                        else {
                                            getSongData();
                                        }
                                    });
                            };

                            var updateSong = function(){
                                console.log('update song');
                                return filesService.streams.update(oldPath, file)
                                    .success(function(response){
                                        console.log(response);
                                    })
                                    .error(function(error){
                                        $scope.error = error;
                                    })
                                    .finally(function(){
                                        getSongData();
                                    });
                            };

                            var getSongData = function(){
                                console.log('get song data');
                                return filesService.find(oldPath)
                                    .success(function(songData){
                                        console.log(song);
                                        $scope.song = songData.item[0];
                                        $scope.song.artist = $scope.artistName;
                                        if(title === ''){
                                            $scope.song.title = $scope.songTitle;
                                        }
                                        else {
                                            $scope.song.title = title;
                                        }
                                        $scope.song.pic = $scope.album.coverId;
                                        $scope.song.url = $scope.apiUrl + '/file-streams/'+ $scope.song.id;
                                    })
                                    .error(function(error){
                                        $scope.error = error;
                                    })
                                    .finally(function(){
                                        updateAlbum();
                                    });
                            };

                            var updateAlbum = function(){
                                $scope.album.playlist[index] = $scope.song;
                                return albumsService.update($scope.album)
                                    .success(function(){
                                    })
                                    .error(function(error){
                                        $scope.error = error;
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
                                        $scope.error = error;
                                    })
                                    .finally(function(){
                                        //TODO: set the new song form input to pristine state.
                                        //this is a temporary hack
                                        document.getElementById('newSongTitle').value = null;
                                        document.getElementById('newSongFile').value = null;
                                        $scope.newSong.$setPristine();
                                    });
                            };

                           getAlbum();       
                        };
                        */

                        $scope.checkAudioFileType = function() {
                            $timeout(function() {
                                if($scope.file.blob.type === 'audio/mp3' || $scope.file.blob.type === 'audio/m4a') {
                                    $scope.invalidAudioFileType = false;
                                } else {
                                    $scope.invalidAudioFileType = true;
                                }
                            });
                        };

                        $scope.cancelEdit = function() {
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
