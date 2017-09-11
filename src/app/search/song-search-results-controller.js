(function(angular) {
    'use strict';

angular.module('media-gallery')
    .controller('SearchResultsCtrl', ['$scope', '$state', 'baasicUserProfileService',
        function ($scope, $state, baasicUserProfileService) {


            function parseProfileList(profileList) {
                $scope.pagerData = {
                    currentPage: profileList.page,
                    pageSize: profileList.recordsPerPage,
                    totalRecords: profileList.totalRecords,
                    hasPrevious: profileList.page > 1,
                    hasNext: profileList.page < Math.ceil(profileList.totalRecords/profileList.recordsPerPage)
                };

                $scope.profiles = profileList;
                $scope.hasProfiles = profileList.totalRecords > 0;
            }

            var options = {
                rpp: 10,
                search: $state.params.search,
                embed: 'avatar',                
                page: $state.params.page || 1
            };

            /*
            if ($state.params.search || $state.params.type) {
                var folderPath = '';
                switch ($state.params.type.toLowerCase()) {
                    case 'cities-and-villages':
                        folderPath = '/' + 'Cities and Villages' + '/';
                        break;
                    default:
                        folderPath = '/' + $state.params.type + '/';
                        break;
                }
                options.search = folderPath + ($state.params.search || '');
            }
            */

            baasicUserProfileService.find(options)
                .success(function(result){
                    parseProfileList(result);
                }) 
                .error(function (error) {
                    $scope.error = error;
                }
            );

            $scope.prevPage = function prevPage() {
                baasicUserProfileService.previous($scope.profiles)
                    .success(function(result){
                        parseProfileList(result);
                    })
                    .error(function (error) {
                        $scope.error = error;
                    }); 
            };

            $scope.nextPage = function nextPage() {
                baasicUserProfileService.next($scope.profiles)
                    .success(function(result) {
                        parseProfileList(result);
                    })
                    .error(function (error) {
                        $scope.error = error;
                    });
            };
        }
    ]);

}(angular));