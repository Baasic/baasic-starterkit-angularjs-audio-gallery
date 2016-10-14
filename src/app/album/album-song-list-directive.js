(function(angular) {
    'use strict';
    angular.module('media-gallery')
    .directive('albumSongList', function(){

     return {
        restrict: 'AE',
        templateUrl:'templates/album/template-album-songlist.html',
        scope: '=',
        controller: ['$scope', '$state', '$stateParams', '$q', 'filesService',
        function($scope, $state, $stateParams, $q, filesService) {

            $scope.songs = [];

            filesService.find($state.params.albumId,{
                page: 1,
                rpp: 10,
                orderBy: 'songNo',
                orderDirection : 'asc',
                links: 'stream-token'
            })
            .success(function(data) {
                $scope.songs = data.item;

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
        }],
    };
});

}(angular));