(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('profileList', [
        function profileList() {
            return {
                restrict: 'AE',
                scope: '=',
                controller: ['$scope', '$state', '$stateParams', '$q', 'baasicUserProfileService',
                    function ($scope, $state, $stateParams, $q, baasicUserProfileService) {

                        $scope.$root.loader.suspend();

                        console.log('logging state inside profile-list directive');
                        console.log($state); //jshint ignore: line

                        function loadProfiles() {
                            baasicUserProfileService.find({
                                page: $state.params.page || 1,
                                rpp: 10,
                                search: $state.params.search,
                                embed: 'avatar'
                            })
                            .success(function profileList(profiles) {
                                $scope.profiles = profiles;
                                $scope.profiles.pagerData = {
                                    currentPage: profiles.page,
                                    pageSize: profiles.recordsPerPage,
                                    totalRecords: profiles.totalRecords,
                                    hasPrevious: profiles.page > 1,
                                    hasNext: profiles.page < Math.ceil(profiles.totalRecords/profiles.recordsPerPage)
                                };
                                $scope.hasProfiles = profiles.totalRecords > 0;
                            })
                            .error(function (error) {
                                console.log(error); //jshint ignore: line
                            })
                            .finally(function () {
                                $scope.$root.loader.resume();
                            });
                        }

                        loadProfiles();
                    }
                ],
                templateUrl: 'templates/profile/template-profile-list.html'
            };
        }
    ]
);
}(angular));
