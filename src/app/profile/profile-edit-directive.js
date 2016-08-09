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
                        $state.go('login');
                    }

                    $scope.backToDetails = function backToDetails() {
                        $state.go('master.main.profile', {artistId: $scope.$root.user.id});
                    };

                    profileService.get($state.params.artistId)
                    .success(function (profile) {
                        $scope.profile = profile;
                    })
                    .error(function (error) {
                                    console.log(error); // jshint ignore: line
                                })
                    .finally(function () {
                                   // $scope.backToDetails();
                               });



                    $scope.saveProfile = function saveProfile(profile) {
                        $scope.profile = profile;
                        var promise;
                        if (!profile.id) {
                            promise = profileService.create(profile);
                        } else {
                            promise = profileService.update(profile);
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

                        });
                    };

                    $scope.cancelEdit = function cancelEdit() {
                        $scope.backToDetails();
                    };
                }
            ],
            templateUrl: 'templates/profile/template-profile-edit.html'

        };
    }
]);