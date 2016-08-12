angular.module('media-gallery')
    .directive('profileDetail', [
        function profileDetail() {
            'use strict';

            return {
                restrict: 'AE',
                scope: '=',
                controller: ['$scope', '$state', '$q', 'baasicUserProfileService',
                    function baasicProfileDetail($scope, $state, $q, baasicUserProfileService) {
                        function loadProfile() {
                            $scope.$root.loader.suspend();
                            baasicUserProfileService.get($state.params.artistId, {
                            })
                                .success(function (data) {
                                    $scope.profile = data;
                                })
                                .error(function (error) {
                                    console.log (error); // jshint ignore: line
                                })
                                .finally(function (response){
                                    console.log (response); // jshint ignore: line
                                    $scope.$root.loader.resume();
                                });

                        }

                        loadProfile();

                    }

                ],
                templateUrl: 'templates/profile/template-profile-detail.html'
            };
        }
    ]);