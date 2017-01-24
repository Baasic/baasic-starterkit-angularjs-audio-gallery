angular.module('media-gallery')
    .directive('profileEdit', ['$parse',
        function profileList($parse) {
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
                controller: ['$scope', '$state', '$q', '$window','baasicUserProfileService', 'baasicUserProfileAvatarService', 'baasicFilesService',
                function ($scope, $state, $q, $window, profileService, avatarService, filesService) {

                    if (!$scope.$root.user.isAuthenticated) {
                        $state.go('master.main.profile', {artistId: $state.params.artistId});
                    }

                    function loadProfile() {
                        $scope.$root.loader.suspend();
                        $scope.albums = [];
                        profileService.get($state.params.artistId, {
                            embed: 'avatar'
                        })
                            .success(function (profile) {
                                $scope.profile = profile;
                            })
                            .error(function (error) {
                                console.log (error); // jshint ignore: line
                            })
                            .finally(function (){
                                loadProfileCover();
                                $scope.$root.loader.resume();
                            });
                    }

                    function loadProfileCover() {
                        filesService.get($scope.profile.coverPath)
                            .success(function (cover) {
                                if(cover.path) {
                                    $scope.profileCover = cover;
                                } else {
                                    $scope.profileCover = '/assets/img/img.png';
                                }

                            })
                            .error(function (error){
                                console.log(error);
                                if($scope.user.id == $state.params.artistId && error === '"Resource not found."') {
                                    $state.go('master.main.profile-add', {artistId: $state.params.artistId});
                                }
                            })
                            .finally(function(){
                                $scope.$root.loader.resume();
                            });
                    }

                    loadProfile();

                    $scope.saveProfile = function saveProfile(profile) {
                        $scope.$root.loader.suspend();

                        $scope.profile = profile;
                        $scope.profile.avatar.rnd = Math.random(10).toString().substring(7);

                        var promise;
                        if (!profile.id) {
                            promise = profileService.create($scope.profile);
                        } else {
                            promise = profileService.update($scope.profile);
                        }

                        if(profile.avatar.change) {
                            var avatarEdit;
                            if (!profile.avatar.id) {
                                avatarEdit = avatarService.streams.create($scope.profile.id, 'avatar', $scope.profile.avatar.blob);
                            } else {
                                avatarEdit = avatarService.streams.update($scope.profile.id, $scope.profile.avatar.blob);
                            }

                        }

                        promise
                        .success(function () {
                            if(profile.avatar.change){
                                avatarEdit
                                    .success(function(data, stream) {
                                    })
                                    .error(function(error) {
                                        console.log(error);
                                    })
                                    .finally(function (){
                                        $scope.$root.loader.resume();
                                    });
                            }
                            if ($scope.onSaveFn) {
                                $scope.onSaveFn($scope.$parent);
                            }
                        })
                        .error(function (error) {
                            $scope.error = error.message;
                        })
                        .finally(function () {
                            $scope.$root.loader.resume();
                            $state.go('master.main.profile', {artistId: $state.params.artistId}, {reload:true});

                        });
                    };
                    $scope.cancelEdit = function cancelEdit() {
                        $state.go('master.main.profile', {artistId: $state.params.artistId});
                    };
                }

            ],
            templateUrl: 'templates/profile/template-profile-edit.html'
        };
    }
]);