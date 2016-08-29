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
                controller: ['$scope', '$state', '$q', 'baasicDynamicResourceService',
                    function ($scope, $state, $q, albumService) {

                        if (!$scope.$root.user.isAuthenticated) {
                            $state.go('master.login');
                        }

                        $scope.backToDetails = function backToDetails() {
                            $state.go('master.main.profile', {artistId : $scope.$root.user.id});
                        };

                        $scope.albumId = $state.params.albumId;

                        albumService.get('albums',{
                            id: $scope.albumId
                        })
                            .success(function (album) {
                                $scope.album = album;
                            })
                            .error(function (error) {
                                console.log(error); // jshint ignore: line
                            })
                            .finally(function () {

                            });



                        $scope.saveAlbum = function saveAlbum(album) {
                            $scope.$root.loader.suspend();
                            var promise;
                            if (!album.id) {
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
                                    $scope.error = error.message;
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