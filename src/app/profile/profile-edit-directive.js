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
                controller: ['$scope', '$state', '$q', '$window','profileService', 'baasicUserProfileAvatarService',
                function ($scope, $state, $q, $window, profileService, avatarService) {

                    if (!$scope.$root.user.isAuthenticated) {
                        $state.go('master.main.profile', {artistId: $state.params.artistId});
                    }

                    $scope.loadProfiles = function(){

                        profileService.get($state.params.artistId, {
                            embed: 'avatar'
                        })
                        .success(function (profile) {
                            $scope.profile = profile;
                        })
                        .error(function (error) {
                            console.log(error); // jshint ignore: line
                            if(error === '"Resource not found."') {
                                $scope.$root.loader.resume();
                                $state.go('master.main.profile-add', {artistId: $state.params.artistId});
                            }
                        })
                        .finally(function () {

                        });
                    };

                    $scope.loadProfiles();

                    $scope.saveProfile = function saveProfile(profile) {
                        $scope.$root.loader.suspend();

                        $scope.profile = profile;
                        var promise;
                        if (!profile.id) {
                            promise = profileService.create(profile);
                        } else {
                            promise = profileService.update(profile);
                        }

                        if(profile.avatar.change) {
                            var avatarEdit;
                            if (!profile.avatar.id) {
                                avatarEdit = avatarService.streams.create($scope.profile.id, 'avatar', profile.avatar.blob);
                            } else {
                                avatarEdit = avatarService.streams.update($scope.profile.id, profile.avatar.blob);
                            }
                        }


                        promise
                        .success(function () {
                            if(profile.avatar){
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
                            $state.go('master.main.profile', {artistId: $state.params.artistId}, {reload:true});
                            $window.location.reload();
                            $scope.$root.loader.resume();
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