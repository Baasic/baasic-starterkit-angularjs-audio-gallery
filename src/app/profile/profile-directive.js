angular.module('media-gallery')
    .directive('baasicProfile', [
        function baasicProfile() {
            'use strict';

            return {
                restrict: 'AE',
                scope: { artistId: '=artistId' },
                controller: ['$scope', '$q', 'baasicUserProfileService',
                    function baasicFindProfile($scope, $q, profileService) {
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
                                    });
                            }
                        });
                    }

                ],
                templateUrl: 'templates/profile/template-profile.html'
            };
        }
    ]);