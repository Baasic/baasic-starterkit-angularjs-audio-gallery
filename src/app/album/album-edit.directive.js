(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('albumEdit', ['$parse',
        function albumList($parse) {

            return {
                restrict: 'AE',
                scope: true,
                replace: true,
                compile: function () {
                    return {
                        pre: function (scope, elem, attrs) {
                            if (attrs.onSave) {
                                scope.onSaveFn = $parse(attrs.onSave);
                            }

                            if (attrs.onCancel) {
                                scope.onCancelFn = $parse(attrs.onCancel);
                            }
                        }
                    };
                },
                controller: ['$scope', '$state', '$q', 'albumsService', 'baasicFilesService', '$sce',
                    function ($scope, $state, $q, albumsService, filesService, $sce) {

                        if (!$scope.$root.user.isAuthenticated) {
                            $state.go('master.main.login');
                        }

                        $scope.getAlbum = function getAlbum() {
                            albumsService.get($state.params.albumId)
                                .success(function (album) {
                                    $scope.album = album;
                                })
                                .error(function (error) {
                                    console.log(error); // jshint ignore:line
                                });
                        };

                        $scope.getAlbum();

                        $scope.backToDetails = function backToDetails() {
                            $state.go('master.main.profile', {artistId : $scope.$root.user.id});
                        };

                        $scope.saveAlbum = function saveAlbum(album) {
                            if(album){
                                var promise;
                                if (album.id === undefined) {
                                    album.artistId = $state.params.artistId;
                                    promise = albumsService.create(album);
                                } else {
                                    promise = albumsService.update(album);
                                }

                                promise
                                    .success(function () {
                                        if ($scope.onSaveFn) {
                                            $scope.onSaveFn($scope.$parent);
                                        }
                                    })
                                    .error(function (error) {
                                        $scope.error = error;
                                    })
                                    .finally(function () {
                                        $scope.backToDetails();
                                    });
                            }
                        };
                        $scope.cancelEdit = function () {
                            $scope.backToDetails();
                        };
                    }
                ],
                templateUrl: 'templates/album/template-album-edit-form.html'
            };
        }
    ]);

}(angular));