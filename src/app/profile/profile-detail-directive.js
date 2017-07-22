(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('profileDetail', [
        function profileDetail() {

            return {
                restrict: 'AE',
                scope: '=',
                controller: ['$scope', '$state', '$stateParams', '$q', 'baasicUserProfileService', 'baasicFilesService',
                    function baasicProfileDetail($scope, $state, $stateParams, $q, profileService, filesService) {
                        function loadProfile() {
                            $scope.albums = [];
                            profileService.get($state.params.artistId, {
                                embed: 'avatar'
                            })
                                .success(function (profile) {
                                    $scope.profile = profile;
                                })
                                .error(function (error) {
                                    console.log (error); // jshint ignore: line
                                    if (error === '"Resource not found."') {
                                        $state.go('master.main.profile-add', {artistId: $state.params.artistId});
                                    }
                                })
                                .finally(function (){
                                    if ($scope.profile.coverId) {
                                        loadProfileCover();
                                    }
                                });
                        }
                        function loadProfileCover() {
                            filesService.get($scope.profile.coverId, {
                            })
                                .success(function (cover) {
                                    $scope.cover = cover;
                                })
                                .error(function(error) {
                                    $scope.error = error;
                                })
                                .finally(function() {

                                });
                        }

                        loadProfile();


                        $scope.deleteProfile = function() {
                            if($scope.albums.length === 0) {
                                if (window.confirm('By deleting your profile, all your data will be irrecoverably lost. Are you sure that you want to delete your profile?')) {
                                    profileService.remove($scope.profile)
                                        .success(function () {
                                        })
                                        .error(function (error) {
                                            $scope.error = error;
                                        })
                                        .finally(function () {
                                            $state.go('master.main.index');
                                        });
                                }
                            } else {
                                window.confirm('You have to first delete all your albums to be able to delete your profile! Would you like to delete all your albums?');
                                //pseudo TODO
                                /*
                                pronađi sve albume ovog profila i redom ih obriši zajedno sa pjesmama i coverima, profile avatar i profile cover isto
                                */
                            }

                        };
                    }
                ],
                templateUrl: 'templates/profile/template-profile-detail.html'
            };
        }
    ]);

}(angular));
