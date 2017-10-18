(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('albumDetails', ['$parse',
        function albumList() {
            return {
                restrict: 'AE',
                scope: true,
                replace: true,
                controller: ['$scope', '$state', '$q', 'albumsService', 'baasicFilesService', 'baasicApp',
                    function ($scope, $state, $q, albumsService, filesService, baasicApp) {
                        var app = baasicApp.get();
                        $scope.apiUrl = app.getApiUrl();
                        $scope.albumId = $state.params.albumId;
                        $scope.songUrlList = [];


                        //please login if not logged in
                        if (!$scope.$root.user.isAuthenticated) {
                            $state.go('master.main.login');
                        }

                        //back to profile page
                        $scope.backToDetails = function backToDetails() {
                            $state.go('master.main.profile', {artistId : $scope.$root.user.id});
                        };

                        $scope.$on('albumUpdated', function() {
                            getAlbum();
                        });

                        //get me album
                        function getAlbum() {
                            $scope.$root.loader.suspend();
                            albumsService.get($scope.albumId)
                                .success(function (album) {
                                    $scope.album = album;
                                    if($scope.album.playlist) {
                                        if($scope.album.playlist.length) {
                                            $scope.songUrlList = [];
                                            for(var i = 0; i< $scope.album.playlist.length; i++){
                                                var url = $scope.album.playlist[i].url + '?rnd=' + $scope.album.rnd;
                                                $scope.songUrlList.push(url);
                                            }
                                        }
                                    }
                                })
                                .error(function (error) {
                                    console.log(error); //jshint ignore: line
                                })
                                .finally(function(){
                                    $scope.album.cover = $scope.apiUrl + 'file-streams/' + $scope.album.coverId + '?rnd=' + $scope.album.rnd;
                                    $scope.$root.loader.resume();
                                });
                        }
                        getAlbum();
                    }
                ],
                templateUrl: 'templates/album/template-album-details.html'
            };
        }
    ]);
}(angular));
