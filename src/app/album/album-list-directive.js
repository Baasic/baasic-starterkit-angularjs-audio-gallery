(function(angular) {
    'use strict';

    angular.module('media-gallery')
    .directive('albumList', function(){

     return {
        restrict: 'AE',
        templateUrl:'templates/album/template-album-list.html',
        scope: '=',
        controller: ['$scope', '$state', '$stateParams', '$q', 'albumsService', 'baasicFilesService',
        function($scope, $state, $stateParams, $q, albumsService, filesService) {

            function loadAlbumCovers (){
                return filesService.streams.get($scope.album.coverId)
                .success(function(cover){
                    $scope.cover = cover;
                })
                .error (function(error){
                    $scope.error = error; //jshint ignore: line
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

                    $scope.pagerData = {
                        currentPage: data.page,
                        pageSize: data.recordsPerPage,
                        totalRecords: data.totalRecords
                    };
                })
                .error(function(error) {
                        console.log(error); // jshint ignore: line
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

            $scope.deleteAlbum = function(album) {
                if (window.confirm('Are you sure you want to delete album ' + $scope.albums[album].name + '?')) {
                    var coverId = $scope.albums[album].coverId;

                    function getAlbumCover() {
                        console.log('get album cover'); //jshint ignore: line
                        filesService.get(coverId)
                            .success(function(cover){
                                console.log('get album cover - success'); //jshint ignore: line
                                $scope.cover = cover;
                            })
                            .error(function(error){
                                console.log('get album cover - error'); //jshint ignore: line
                                console.log(error); // jshint ignore:line
                            })
                            .finally(function(){
                                deleteAlbumCover();
                            });
                    };
                    function deleteAlbumCover(){
                        console.log('delete album cover'); //jshint ignore: line
                        if($scope.cover) {
                            filesService.remove($scope.cover)
                                .success(function(){
                                    console.log('delete album cover - success'); //jshint ignore: line
                                })
                                .error(function(error){
                                    console.log('delete album cover - error'); //jshint ignore: line
                                    console.log(error); //jshint ignore: line
                                })
                                .finally(function(){
                                    console.log($scope.albums[album]) //jshint ignore: line
                                    if($scope.albums[album].playlist) {
                                        if($scope.albums[album].playlist.length){
                                            deleteAlbumSongs();
                                        } else {
                                            deleteAlbumData();
                                        }
                                    } else {
                                        deleteAlbumData();
                                    }
                                });
                        } else {
                            if($scope.albums[album].playlist) {
                                if($scope.albums[album].playlist.length){
                                    deleteAlbumSongs();
                                } else {
                                    deleteAlbumData();
                                }
                            } else {
                                deleteAlbumData();
                            }                            
                        }
                    }
                    
                    var deleteAlbumSongs = function(){
                        console.log('delete album songs'); //jshint ignore: line
                        var idList = [];
                        var playlist = $scope.albums[album].playlist;
                        var length = $scope.albums[album].playlist.length;

                        function createList(list) {
                          for (var i=0; i<length; i++) {
                            idList.push({id: list[i].id});
                          }
                          return idList;
                        }

                        if (playlist.length) {
                            createList(playlist);
                        }

                        console.log('batch removing songs'); //jshint ignore: line
                        return filesService.batch.remove(idList)
                            .success(function (data) {
                                 console.log(data); //jshint ignore: line
                            })
                            .error(function (error) {
                                console.log(error); //jshint ignore: line
                            })
                            .finally(function () {
                                deleteAlbumData();

                            });
                    };

                    var deleteAlbumData = function() {
                        console.log('delete album data'); //jshint ignore: line
                        albumsService.remove($scope.albums[album])
                            .success(function () {
                                $scope.albums.splice(album,1);
                                loadAlbums();
                            })
                            .error(function (error) {
                                console.log(error); //jshint ignore: line
                            })
                            .finally(function () {
                                $scope.backToDetails();
                            });
                    };
                    getAlbumCover();
                }
            };
        }],
    };
});

}(angular));
