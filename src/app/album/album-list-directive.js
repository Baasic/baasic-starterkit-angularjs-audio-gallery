(function(angular) {
    'use strict';
    angular.module('media-gallery')
    .directive('albumList', function(){

       return {
        restrict: 'AE',
        templateUrl:'templates/album/template-album-list.html',
        scope: "=",
        controller: ['$scope', '$state', '$stateParams', '$q', 'baasicDynamicResourceService',
            function($scope, $state, $stateParams, $q, albumService) {
                $scope.$root.loader.suspend();
                $scope.profileName = $scope.profileName;
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

                    $scope.$root.loader.resume();
                });
                $scope.backToDetails = function backToDetails() {
                    $state.go('master.main.profile', {artistId : $scope.artistId});
                };
            }],
        };
    });

}(angular));