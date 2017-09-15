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

                        
                        $scope.songArray = [];
                        $scope.songFileArray = [];

                        $scope.$watch('album.playlist', function(){
                            if($scope.album){
                                if($scope.album.playlist.length) {
                                    $scope.songArray = angular.copy($scope.album.playlist);
                                }
                            }
                        });

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
                                        $scope.invalidAudioFileType = false;                                        
                                    });
                            };
                            if(!$scope.invalidAudioFileType){
                                getAlbum();
                            }
                        };
                      
                        $scope.checkUpdateFileType = function(index) {
                            $timeout(function() {
                                var obj = $scope.songFileArray[index];
                                //audio/mp3 is for chrome, 
                                if(obj.file.blob.type === 'audio/mp3' || obj.file.blob.type === 'audio/m4a' || obj.file.blob.type === 'audio/mpeg') {
                                    $scope.songFileArray[index].invalid = false;
                                } else {
                                    $scope.songFileArray[index].invalid = true;
                                }
                            });                            
                        };
                        
                        $scope.saveEditedSong = function(song) {
                            var index = $scope.songArray.indexOf(song);
                            var fileToUpdate;
                            var titleToUpdate = '';
                            var albumToUpdate;
                            var path = song.path;                           

                            if(song.title !== $scope.album.playlist[index].title){
                                titleToUpdate = song.title;
                            }
                            if($scope.songFileArray[index]){
                                if($scope.songFileArray[index].file){
                                    if($scope.songFileArray[index].file.blob){
                                        fileToUpdate = $scope.songFileArray[index].file.blob;
                                    }
                                }
                            }

                            var getAlbum = function() {
                                return albumsService.get($scope.albumId, {})
                                    .success(function(album){
                                        albumToUpdate = album;
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
                                return profileService.get(albumToUpdate.artistId)
                                    .success(function(artist){
                                        $scope.artistName = artist.displayName;
                                    })
                                    .error(function(error){
                                        $scope.error = error;
                                    })
                                    .finally(function(){
                                        if(fileToUpdate){
                                            updateSong();
                                        }
                                        else {
                                            updateAlbum();
                                        }
                                    });
                            };

                            var updateSong = function(){
                                return filesService.streams.update(path, fileToUpdate)
                                    .success(function(response){
                                    })
                                    .error(function(error){
                                        $scope.error = error;
                                    })
                                    .finally(function(){
                                        //getSongData();
                                        updateAlbum();
                                    });
                            };

                            /*
                            var getSongData = function(){
                                console.log('get song data...');
                                return filesService.find(path)
                                    .success(function(songData){
                                        console.log(songData);
                                        songToUpdate = songData.item[0];
                                    //    songToUpdate.artist = $scope.artistName;
                                        if(titleToUpdate === ''){
                                            songToUpdate.title = $scope.album.playlist[index].title
                                        }
                                    //    else {
                                    //        $scope.song.title = titleToUpdate;
                                    //    }
                                    //    songToUpdate.pic = albumToUpdate.coverId;
                                    //    songToUpdate.url = $scope.apiUrl + '/file-streams/'+ $scope.song.id;
                                    })
                                    .error(function(error){
                                        $scope.error = error;
                                    })
                                    .finally(function(){
                                        updateAlbum();
                                    });
                            };
                            */

                            var updateAlbum = function(){
                                if(titleToUpdate !== '') {
                                    albumToUpdate.playlist[index].title = titleToUpdate;
                                }
                                
                                return albumsService.update(albumToUpdate)
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
                                        //refresh song list here

                                        //TODO: set the new song form input to pristine state.
                                        //this is a temporary hack
                                        $scope.songFileArray = []; 
                                        $scope.songArray = angular.copy($scope.album.playlist);

                                        document.getElementById('newSongTitle').value = null;
                                        document.getElementById('newSongFile').value = null;
                                        $scope.newSong.$setPristine();
                                        $scope.invalidAudioFileType = false;                                        
                                    });
                            };

                           getAlbum();       
                        };
                        
                        $scope.checkAudioFileType = function() {
                            $timeout(function() {
                                if($scope.file.blob.type === 'audio/mp3' || $scope.file.blob.type === 'audio/m4a' || obj.file.blob.type === 'audio/mpeg') {
                                    $scope.invalidAudioFileType = false;
                                } else {
                                    $scope.invalidAudioFileType = true;
                                }
                            });
                        };

                        $scope.cancel = function() {
                            //TODO: set the new song form input to pristine state.
                            //this is a temporary hack
                            $scope.songFileArray = []; 
                            $scope.songArray = angular.copy($scope.album.playlist);
                            
                            document.getElementById('newSongTitle').value = null;
                            document.getElementById('newSongFile').value = null;
                            $scope.newSong.$setPristine();
                            $scope.invalidAudioFileType = false;
                        };
                    }
                ],
                templateUrl: 'templates/album/template-album-songs-add.html'
            };
        }
    ]);
}(angular));
