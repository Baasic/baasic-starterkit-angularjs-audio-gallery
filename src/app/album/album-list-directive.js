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
                    var getAlbumCover = function() {
                        filesService.get(coverId)
                            .success(function(cover){
                                $scope.cover = cover;
                            })
                            .error(function(error){
                                console.log(error); // jshint ignore:line
                            })
                            .finally(function(){
                                deleteAlbumCover();
                            });
                    };
                    var deleteAlbumCover = function(){
                        return filesService.remove($scope.cover)
                            .success(function(){
                            })
                            .error(function(error){
                                console.log(error); //jshint ignore: line
                            })
                            .finally(function(){
                                deleteAlbumData();
                            });
                    };
                    var deleteAlbumData = function() {
                        return albumsService.remove($scope.albums[album])
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
