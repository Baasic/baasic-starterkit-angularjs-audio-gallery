angular.module('media-gallery')
    .directive('profileDetail', [
        function profileDetail() {
            'use strict';

            return {
                restrict: 'AE',
                scope: '=',
                controller: ['$scope', '$state', '$stateParams', '$q', 'baasicUserProfileService', 'baasicFilesService',
                    function baasicProfileDetail($scope, $state, $stateParams, $q, profileService, filesService) {
                        function loadProfile() {
                            $scope.$root.loader.suspend();
                            $scope.albums = [];
                            profileService.get($state.params.artistId, {
                                embed: 'avatar'
                            })
                                .success(function (profile) {
                                    $scope.profile = profile;
                                })
                                .error(function (error) {
                                    console.log (error); // jshint ignore: line
                                })
                                .finally(function (){
                                    loadProfileCover();
                                });
                        }
                        function loadProfileCover() {
                            filesService.get($scope.profile.coverPath, {
                            })
                                .success(function (cover) {
                                    if(cover.path) {
                                        $scope.profileCover = cover;
                                    }
                                })
                                .error(function (error){
                                    console.log(error);
                                })
                                .finally(function(){
                                    $scope.$root.loader.resume();
                                });
                        }

                        loadProfile();


                        $scope.deleteProfile = function(profile) {
                            if($scope.albums.length === 0) {
                                if (confirm('By deleting your profile, all your data will be irrecoverably lost. Are you sure that you want to delete your profile?')) {
                                    profileService.remove($scope.profile)
                                        .success(function () {
                                            console.log('Profile deleted!');
                                        })
                                        .error(function (error) {
                                            console.log (error); // jshint ignore: line
                                        })
                                        .finally(function () {
                                            $state.go('master.main.index');
                                        });
                                }
                            } else {
                                window.alert('You have to first delete all your albums to be able to delete your profile!');
                            }

                        };
                    }
                ],
                templateUrl: 'templates/profile/template-profile-detail.html'
            };
        }
    ]);