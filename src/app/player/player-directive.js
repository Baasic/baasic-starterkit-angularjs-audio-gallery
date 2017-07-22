(function(angular) {
    'use strict';

    angular.module('media-gallery')
    .directive('mediaPlayer', function(){

     return {
        restrict: 'AE',
        templateUrl:'templates/player/template-player.html',
        scope: '=',
        controller: ['$scope', '$state', '$stateParams', '$q', 'albumsService', 'baasicFilesService',
        function($scope, $state, $stateParams, $q, albumsService, filesService) {

            //playlist open/close
            $scope.playlistActive = false;
            $scope.playlistToggle = function() {
                $scope.playlistActive = !$scope.playlistActive;
            };

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
                    $scope.firstAlbum = $scope.albums[0];
                    loadAlbumCovers();
                });
            }

            loadAlbums();

            function loadAlbumCovers() {
                filesService.find({
                    search: $scope.firstAlbum.coverPath
                })
                .success(function(data) {
                    $scope.firstAlbum.coverUrl = data.item[0].links('stream-token').href;
                })
                .error(function(error) {
                    console.log(error); // jshint ignore: line
                });
            }


        }],
    };
});

}(angular));
