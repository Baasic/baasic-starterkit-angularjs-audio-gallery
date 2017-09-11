(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('profileDetail', [
        function profileDetail() {

            return {
                restrict: 'AE',
                scope: '=',
                controller: ['$scope', '$state', '$stateParams', '$q', 'baasicUserProfileService', 'baasicUserProfileAvatarService', 'baasicFilesService', 'albumsService',
                    function baasicProfileDetail($scope, $state, $stateParams, $q, profileService, avatarService ,filesService, albumsService) {
                        
                        function loadProfile() {
                            $scope.albums = [];
                            $scope.artistId = $state.params.artistId;
                            var profileExists;
                            profileService.get($state.params.artistId, {
                                embed: 'avatar'
                            })
                                .success(function (profile) {
                                    $scope.profile = profile;
                                })
                                .error(function (error) {
                                    $scope.error = error;
                                    if (error === '"Resource not found."') {
                                        $state.go('master.main.profile-edit', {artistId: $state.params.artistId});
                                    }
                                })
                                .finally(function (){
                                    if($scope.profile) {
                                        profileExists = true;
                                    } else {
                                        profileExists = false;
                                    }
                                });
                        }

                        loadProfile();

                        $scope.deleteProfile = function() {
                            var avatarId = $scope.profile.id;
                            var avatarToDelete = null;
                            var albumIdList = [];
                            var albumList = $scope.albums;                                
                            var albumCoverIdList = [];
                            var albumCoverList = [];
                            var albumListLength = $scope.albums.length;
                            var songIdList = [];
                            var albumsToDelete = [];

                            if(albumListLength > 0) {
                                createAlbumIdList(albumList);
                                createAlbumCoverIdList(albumList);
                                createSongIdList(albumList);
                            }

                            function deleteAllData() {
                                getAvatar();
                            }

                            //iterate trough all albums and push their id's into albumIdList
                            function createAlbumIdList(list) {
                                for(var i = 0; i < albumListLength; i++) {
                                    albumIdList.push({id: list[i].id});
                                }
                                return albumIdList;
                            }

                            //iterate trough all albums and push their cover ID's into albumCoverIdList
                            function createAlbumCoverIdList(list) {
                                for(var i = 0; i<albumListLength; i++) {
                                    if(albumList[i].coverId) {
                                        albumCoverIdList.push({id: list[i].coverId});
                                    }
                                }
                                return albumCoverIdList;
                            }

                            //iterate trough a list of all albums
                            //add the id of each song in each album's playlist to the list
                            function createSongIdList(list) {
                                for(var i=0; i<albumListLength; i++) {
                                    if(list[i].playlist) {
                                        var playlistLength = list[i].playlist.length;
                                        if(playlistLength > 0) {
                                            for(var j = 0; j < playlistLength; j++) {
                                                songIdList.push({id: list[i].playlist[j].id});
                                            }
                                        }
                                    }
                                }
                                return songIdList;
                            }

                            //gets the avatar
                            //if there are albums linked to this profile, calls the function to get and delete albums and related data
                            //if there are no albums, proceds to delete avatar and profile
                            //if avatar is not found, it's assumed that it doesn't exist/is already deleted, so the function proceedsas, but does not call to delete avatar
                            function getAvatar() {
                                avatarService.get(avatarId)
                                .success(function(fileEntry){
                                    avatarToDelete = fileEntry;
                                    if(albumListLength > 0) {
                                        getAlbumCovers();
                                    }
                                    else {
                                        deleteAvatar();
                                    }
                                })
                                .error(function(error){
                                    $scope.error = error;
                                    if(error === '"Resource not found."'){
                                        if(albumListLength > 0) {
                                            getAlbumCovers();
                                        }
                                        else {
                                            deleteProfileData();
                                        }
                                    }
                                    
                                });
                            }

                            //gets all album covers
                            function getAlbumCovers() {
                                var i = 0;
                                function chainedPromise() {
                                    filesService.get(albumCoverIdList[i])
                                    .success(function(data) {
                                        albumCoverList.push(data);
                                    })
                                    .error(function(error){
                                        $scope.error = error;
                                    })
                                    .finally(function(){
                                        if(i >= albumCoverIdList.length - 1) {
                                            getAlbumData();
                                        }
                                        else {
                                            i++;
                                            chainedPromise();
                                        }
                                    });
                                }

                                chainedPromise();
                            }

                            //gets data for all albums
                            function getAlbumData() {
                                var i = 0;
                                function chainedPromise() {
                                    albumsService.get(albumList[i])
                                    .success(function(data) {
                                        albumsToDelete.push(data);
                                    })
                                    .error(function(error) {
                                        $scope.error = error;
                                    })
                                    .finally(function() {
                                        if(i >= albumList.length - 1) {
                                            deleteSongs();
                                        }
                                        else {
                                            i++;
                                            chainedPromise();
                                        }
                                    });
                                }
                                chainedPromise();
                            }

                            //calls fileService.batchDelete and removes all ongs using their id's
                            function deleteSongs () {
                                if(songIdList.length > 0) {
                                    filesService.batch.remove(songIdList)
                                    .success(function(){
                                        deleteAlbumCovers();
                                    })
                                    .error(function(error){
                                        $scope.error = error;
                                    });
                                }
                                else {
                                    deleteAlbumCovers();
                                }
                            }

                            //delete all album covers previously retrieved
                            function deleteAlbumCovers() {
                                var i = 0;
                                function chainedPromise() {
                                    filesService.remove(albumCoverList[i])
                                    .success(function(){
                                    })
                                    .error(function(error) {
                                        $scope.error = error;
                                    })
                                    .finally(function(){
                                        if(i >= albumCoverList.length - 1 ) {
                                            deleteAlbumData();
                                        }
                                        else {
                                            i++;
                                            chainedPromise();
                                        }
                                    });
                                }
                                if(albumCoverList.length > 0){
                                    chainedPromise();                                    
                                }
                                else {
                                    deleteAlbumData();
                                }
                            }

                            //deletes all albums using the retrieved data
                            function deleteAlbumData () {
                                var i = 0;
                                function chainedPromise() {
                                    albumsService.remove(albumsToDelete[i])
                                    .success(function() {
                                    })
                                    .error(function(error) {
                                        $scope.error = error;
                                    })
                                    .finally(function(){
                                        if(i === albumsToDelete.length - 1) {
                                            deleteAvatar();
                                        }
                                        else {
                                            i++;
                                            chainedPromise();
                                        }
                                    });
                                }
                                chainedPromise();
                            }

                            function deleteAvatar() {
                                if(avatarToDelete) {
                                    avatarService.unlink(avatarToDelete)
                                    .success(function() {
                                    })
                                    .error(function(error){
                                        $scope.error = error;
                                    })
                                    .finally(function() {
                                        deleteProfileData();
                                    });
                                }
                                else {
                                    deleteProfileData();
                                }
                            }

                            function deleteProfileData () {
                                return profileService.remove($scope.profile)
                                .success(function () {
                                    $state.go('master.main.index');
                                })
                                .error(function (error) {
                                    $scope.error = error;
                                });
                            }

                            //popup confirmation window
                            if (window.confirm('By deleting your profile, all your data will be irrecoverably lost. Are you sure that you want to delete your profile?')) {
                                deleteAllData();
                            }
                        };
                    }
                ],
                templateUrl: 'templates/profile/template-profile-detail.html'
            };
        }
    ]);

}(angular));