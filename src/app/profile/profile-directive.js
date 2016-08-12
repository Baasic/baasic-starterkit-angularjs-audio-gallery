angular.module('media-gallery')
    .directive('baasicProfile', [
        function baasicProfile() {
            'use strict';

            return {
                restrict: 'AE',
                scope: { artistId: '=artistId' },
                controller: ['$scope', '$q', 'baasicUserProfileService',
                    function baasicFindProfile($scope, $q, profileService) {
                        $scope.$root.loader.suspend();
                        $scope.artistId = '';

                        $scope.$watch('artistId', function() {
                            if($scope.artistId.length > 0) {
                                profileService.get($scope.artistId, {
                                })
                                    .success(function (profile) {
                                        $scope.profile = profile;
                                        $scope.editId = profile.id;
                                    })
                                    .error(function (error) {
                                        console.log(error); // jshint ignore: line
                                    })
                                    .finally(function () {
                                        $scope.$root.loader.resume();
                                    });
                            }
                        });
                    }

                ],
                templateUrl: 'templates/profile/template-profile.html'
            };
        }
    ]);