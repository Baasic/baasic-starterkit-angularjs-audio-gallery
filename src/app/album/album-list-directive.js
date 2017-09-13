(function(angular) {
    'use strict';

    angular.module('media-gallery')
    .directive('albumList', function(){

     return {
        restrict: 'AE',
        templateUrl:'templates/album/template-album-list.html',
        scope: '=',
        controller: ['$scope', '$state', '$stateParams', '$q', 'albumsService', 'baasicFilesService', 'baasicApp',
        function($scope, $state, $stateParams, $q, albumsService, filesService, baasicApp) {
            var app = baasicApp.get();
            $scope.apiUrl = app.getApiUrl();

            function loadAlbumCovers (){
                return filesService.streams.get($scope.album.coverId)
                .success(function(cover){
                    $scope.cover = cover;
                })
                .error (function(error){
                    $scope.error = error;
                })
                .finally(function(){
                });
            }

            function loadAlbums() {
                $scope.albums = [];

                albumsService.find({
                    page: 1,
                    rpp: 10,
                    search: $stateParams.artistId,
                    orderBy: 'releaseYear',
                    orderDirection : 'desc'
                })
                .success(function(data) {
                    $scope.albums = data.item;
                    console.log($scope.albums);
                    
                    $scope.pagerData = {
                        currentPage: data.page,
                        pageSize: data.recordsPerPage,
                        totalRecords: data.totalRecords
                    };
                })
                .error(function(error) {
                    $scope.error = error;
                })
                .finally(function() {
                    $scope.$parent.albums = $scope.albums;
                    loadAlbumCovers();
                });
            }
            loadAlbums();

            $scope.backToDetails = function backToDetails() {
                $state.go('master.main.profile', {artistId : $scope.artistId});
            };

            /*
            $scope.populatePlaylist = function populatePlaylist(album) {
                $scope.songs = [];
                for(var i = 0; i< album.playlist.length; i++){
                    var song = {
                        url: $scope.apiUrl + '/file-streams/' + album.playlist[i].id,
                        coverUrl: $scope.apiUrl + '/file-streams/' + album.coverId,
                        title: album.playlist[i].title,
                        artist: album.playlist[i].artist
                    };
                    $scope.songs.push(song);
                }
                console.log($scope.songs);
            };
            */

            $scope.deleteAlbum = function(album) {
                if (window.confirm('Are you sure you want to delete album ' + $scope.albums[album].name + '?')) {
                    deleteAllData();
                }

                function deleteAllData() {
                    getAlbumCover();
                }
            


                function getAlbumCover() {
                    var coverId = $scope.albums[album].coverId;
                    if(coverId) {
                        filesService.get(coverId)
                        .success(function(cover){
                            $scope.cover = cover;
                            deleteAlbumCover();
                        })
                        .error(function(error){
                            $scope.error = error;
                        });
                    }
                    else {
                        deleteAlbumSongs();
                    }
                }

                function deleteAlbumCover() {
                    if($scope.cover) {
                        filesService.remove($scope.cover)
                        .success(function(){
                            deleteAlbumSongs();
                        })
                        .error(function(error){
                            $scope.error = error;
                        });
                    } else {
                        deleteAlbumSongs();
                    }
                }

                function deleteAlbumSongs() {
                    var idList = [];
                    var playlist = $scope.albums[album].playlist;
                    var length = 0;
                    if($scope.albums[album].playlist) {
                        length = $scope.albums[album].playlist.length;
                    }

                    function createList(list) {
                        for (var i=0; i<length; i++) {
                        idList.push({id: list[i].id});
                        }
                        return idList;
                    }

                    if (length > 0) {
                        createList(playlist);
                    }

                    if(idList.length > 0) {
                        filesService.batch.remove(idList)
                        .success(function () {
                            deleteAlbumData();
                        })
                        .error(function (error) {
                            $scope.error = error;
                        });
                    }
                    else {
                        deleteAlbumData();
                    }
                }

                function deleteAlbumData() {
                    albumsService.remove($scope.albums[album])
                    .success(function () {
                        $scope.albums.splice(album,1);
                        loadAlbums();
                    })
                    .error(function (error) {
                        $scope.error = error;
                    })
                    .finally(function () {
                        $scope.backToDetails();
                    });
                }
            };
        }],
    };
});

}(angular));
