(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('profileDetail', [
        function profileDetail() {

            return {
                restrict: 'AE',
                scope: '=',
                controller: ['$scope', '$state', '$stateParams', '$q', 'baasicUserProfileService', 'baasicUserProfileAvatarService', 'baasicFilesService',
                    function baasicProfileDetail($scope, $state, $stateParams, $q, profileService, avatarService ,filesService) {
                        function loadProfile() {
                            $scope.albums = [];
                            $scope.artistId = $state.params.artistId;
                            var profileExists;
                            profileService.get($state.params.artistId, {
                                embed: 'avatar'
                            })
                                .success(function (profile) {
                                    $scope.profile = profile;
                                })
                                .error(function (error) {
                                    console.log (error); // jshint ignore: line
                                    if (error === '"Resource not found."') {
                                        $state.go('master.main.profile-edit', {artistId: $state.params.artistId});
                                    }
                                })
                                .finally(function (){
                                    if($scope.profile) {
                                        profileExists = true;
                                    } else {
                                        profileExists = false;
                                    }
                                });
                        }

                        loadProfile();

                        $scope.deleteProfile = function() {

                            var avatarId = $scope.profile.avatar.avatarFileEntryId;
                            function deleteAvatar () {
                                return avatarService.streams.get(avatarId)
                                .success(function (fileEntry) {
                                    $scope.avatar = fileEntry;
                                })
                                .error(function (error) {
                                    $scope.error = error;
                                })
                                .finally(function () {
                                    avatarService.unlink($scope.avatar)
                                    .success(function () {
                                    })
                                    .error(function (error) {
                                        $scope.error = error;
                                    })
                                    .finally(function(){
                                        console.log('should be deleted now'); // jshint ignore: line
                                        deleteData();
                                    });
                                });
                            }

                            function deleteData () {
                                return profileService.remove($scope.profile)
                                .success(function () {
                                })
                                .error(function (error) {
                                    $scope.error = error;
                                })
                                .finally(function () {
                                    $state.go('master.main.index');
                                });
                            }

                            if($scope.albums.length === 0) {
                                if (window.confirm('By deleting your profile, all your data will be irrecoverably lost. Are you sure that you want to delete your profile?')) {
                                    deleteAvatar();
                                }
                            } else {
                                window.confirm('You have to first delete all your albums to be able to delete your profile! Would you like to delete all your albums?');
                                //pseudo TODO
                                /*
                                pronađi sve albume ovog profila i redom ih obriši zajedno sa pjesmama, profile avatar isto
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
