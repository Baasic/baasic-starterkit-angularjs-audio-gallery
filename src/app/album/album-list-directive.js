(function(angular) {
    'use strict';
    angular.module('media-gallery')
    .directive('albumList', function(){

     return {
        restrict: 'AE',
        templateUrl:'templates/album/template-album-list.html',
        scope: '=',
        controller: ['$scope', '$state', '$stateParams', '$q', 'baasicDynamicResourceService',
        function($scope, $state, $stateParams, $q, albumService) {

            $scope.albums = [];

            albumService.find('albums',{
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

            });


            $scope.backToDetails = function backToDetails() {
                $state.go('master.main.profile', {artistId : $scope.artistId});
            };

            $scope.deleteAlbum = function(album) {
                if (confirm('Are you sure you want to delete album ' + $scope.albums[album].name + '?')) {

                    albumService.remove($scope.albums[album])
                    .success(function () {
                        $scope.albums.splice(album,1);
                        $state.reload();
                    })
                    .error(function (error) {
                    })
                    .finally(function () {
                        backToDetails();
                    });
                }
            };
        }],
    };
});

}(angular));