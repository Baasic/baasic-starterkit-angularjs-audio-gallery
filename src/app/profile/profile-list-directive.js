angular.module('media-gallery')
    .directive('profileList', [
        function profileList() {
            'use strict';

            return {
                restrict: 'AE',
                scope: '=',
                controller: ['$scope', '$state', '$stateParams', '$q', 'baasicUserProfileService',
                    function ($scope, $state, $stateParams, $q, baasicUserProfileService) {

                        function loadProfiles() {
                            $scope.$root.loader.suspend();

                            baasicUserProfileService.find({
                                page: $state.params.page || 1,
                                rpp: 10,
                                search: $state.params.search
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