(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('albumSongs', [
        function () {
            return {
                restrict: 'E',
                scope: '=',
                controller: ['$scope', '$state', 'baasicFilesService', 'albumsService',
                    function ($scope, $state, filesService, albumsService) {
                        $scope.file = { filename: ''};
                        $scope.model = {};
                        $scope.albumId = $state.params.albumId;
                        if($scope.file.blob) {
                            var path = $scope.albumId + ' / ' + $scope.file.blob.name;
                        }


                        function getAlbum() {
                            return albumsService.get($scope.albumId, {
                            })
                                .success(function(album){
                                    $scope.album = album;

                                });
                        }

                        $scope.cancel = function () {
                            $state.go('master.main.profile', {artistId: $scope.artistId}, {reload:true});
                        };


                    }
                ],
                templateUrl: 'templates/album/template-album-songs-add.html'
            };
        }
    ]);
}(angular));