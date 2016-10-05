angular.module('media-gallery')
    .directive('profileDetail', [
        function profileDetail() {
            'use strict';

            return {
                restrict: 'AE',
                scope: '=',
                controller: ['$scope', '$state', '$stateParams', '$q', 'baasicUserProfileService', 'baasicDynamicResourceService',
                    function baasicProfileDetail($scope, $state, $stateParams, $q, profileService, albumService) {
                        function loadProfile() {
                            $scope.$root.loader.suspend();
                            $scope.albums = [];
                            profileService.get($state.params.artistId, {
                            })
                                .success(function (data) {

                                    $scope.profile = data;
                                    albumService.find('albums',{
                                        page: 1,
                                        rpp: 11,
                                        search: $stateParams.artistId,
                                        orderBy: 'releaseYear',
                                        orderDirection : 'desc'
                                    })
                                    .success(function(data) {
                                        $scope.albums = data.item;

                                        $scope.pagerData = {
                                            currentPage: data.page,
                                            pageSize: data.recordsPerPage,
                                            totalRecords: data.totalRecords
                                        };
                                    })
                                    .error(function(error) {
                                        console.log(error); // jshint ignore: line
                                        if(data.status === 404) {
                                            $state.go('master.main.profile-add', {artistId: $state.params.artistId});
                                        }
                                    })
                                    .finally(function() {
                                        $scope.$root.loader.resume();
                                    });

                                })
                                .error(function (error) {
                                    console.log (error); // jshint ignore: line

                                })
                                .finally(function (){
                                    $scope.$root.loader.resume();
                                });

                        }
                        loadProfile();

                        $scope.deleteProfile = function(profile) {
                            if($scope.albums.length == 0) {
                                if (confirm('By deleting your profile, all your data and albums will be irrecoverably lost. Are you sure that you want to delete your profile?')) {
                                    profileService.remove($scope.profile)
                                        .success(function () {
                                            console.log('Profile deleted!');
                                        })
                                        .error(function (error) {
                                        })
                                        .finally(function () {
                                            $state.go('master.main.index');
                                        });
                                }
                            } else {
                                alert('You have to first delete all your albums to be able to delete your profile!');
                            }

                        };
                    }
                ],
                templateUrl: 'templates/profile/template-profile-detail.html'
            };
        }
    ]);