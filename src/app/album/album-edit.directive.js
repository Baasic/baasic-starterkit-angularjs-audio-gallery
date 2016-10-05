angular.module('media-gallery')
    .directive('albumEdit', ['$parse',
        function albumList($parse) {
            'use strict';

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
                controller: ['$scope', '$state', '$q', 'albumService',
                    function ($scope, $state, $q, albumService) {

                        if (!$scope.$root.user.isAuthenticated) {
                            $state.go('master.main.login');
                        }

                        $scope.backToDetails = function backToDetails() {
                            $state.go('master.main.profile', {artistId : $scope.$root.user.id});
                        };

                        $scope.artistId = $state.params.artistId;
                        $scope.albumId = $state.params.albumId;

                        albumService.get('album',{
                            id: $scope.albumId
                        })
                            .success(function (album) {
                                $scope.album = album;
                            })
                            .error(function (error) {
                                console.log(error); // jshint ignore: line
                                if(error === '"Resource not found."') {
                                    $state.go('master.main.album-add', {artistId: $state.params.artistId});
                                }
                            })
                            .finally(function () {
                                if( !$scope.album.id ){
                                    $scope.album = {};
                                }
                            });

                        $scope.saveAlbum = function saveAlbum(album) {
                            $scope.$root.loader.suspend();
                            $scope.album = { };
                            $scope.album = album;
                            var promise;
                            if (!album.id) {
                                $scope.album.artistId = $scope.artistId;
                                promise = albumService.create(album);
                            } else {
                                promise = albumService.update(album);
                            }

                            promise
                                .success(function () {
                                    if ($scope.onSaveFn) {
                                        $scope.onSaveFn($scope.$parent);
                                    }
                                $scope.backToDetails();
                                })
                                .error(function (error) {
                                    $scope.error = error;
                                })
                                .finally(function () {
                                    $scope.$root.loader.resume();
                                });

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

