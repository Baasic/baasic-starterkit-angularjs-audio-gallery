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
                controller: ['$scope', '$state', '$q', 'baasicUserProfileService',
                function ($scope, $state, $q, profileService) {

                    if (!$scope.$root.user.isAuthenticated) {
                        $state.go('master.main.profile', {artistId: $state.params.artistId});
                    }

                    profileService.get($state.params.artistId)
                        .success(function (profile) {
                            $scope.profile = profile;
                        })
                        .error(function (error) {
                            console.log(error); // jshint ignore: line
                            if(error === '"Resource not found."') {
                                $state.go('master.main.profile-add', {artistId: $state.params.artistId});
                            }
                        })
                        .finally(function () {
                           // $scope.backToDetails();
                       });

                    $scope.reloadRoute = function() {
                        $state.reload();
                    };

                    $scope.saveProfile = function saveProfile(profile) {
                        $scope.$root.loader.suspend();

                        $scope.profile = profile;
                        var promise;
                        if (!profile.id) {
                            promise = profileService.create(profile);
                        } else {
                            promise = profileService.update(profile);
                        }

                        var getNumber = function() {
                            $scope.profile.random = (Math.ceil(Math.random() * 5));
                        };

                        getNumber();

                        promise
                        .success(function () {
                            if ($scope.onSaveFn) {
                                $scope.onSaveFn($scope.$parent);
                            }
                        })
                        .error(function (error) {
                            $scope.error = error.message;
                        })
                        .finally(function () {
                            $state.go('master.main.profile', {artistId: $state.params.artistId});
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