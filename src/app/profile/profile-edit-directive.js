(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('profileEdit', ['$parse',
        function profileList($parse) {

            return {
                restrict: 'AE',
                scope: true,
                replace: true,
                compile: function () {
                    return {
                        pre: function (scope, elem, attrs) {
                            if (attrs.onSave) {
                                scope.onSaveFn = $parse(attrs.onSave);
                            }

                            if (attrs.onCancel) {
                                scope.onCancelFn = $parse(attrs.onCancel);
                            }
                        }
                    };
                },
                controller: ['$scope', '$state', '$q', '$window','baasicUserProfileService', 'baasicUserProfileAvatarService', 'baasicFilesService',
                function ($scope, $state, $q, $window, profileService, avatarService, filesService) {
                    $scope.file = { filename: ''};
                    $scope.model = {};
                    $scope.artistId = $state.params.artistId;
                    var path = $scope.artistId + '/profileCover.jpg';

                    if (!$scope.$root.user.isAuthenticated) {
                        $state.go('master.main.profile', {artistId: $state.params.artistId});
                    }
                    function loadProfile() {
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
                                if ($scope.profile.coverId) {
                                    loadProfileCover();
                                }
                            });
                    }

                    function loadProfileCover() {
                        filesService.get($scope.profile.coverId)
                            .success(function () {
                            })
                            .error(function (error){
                                $scope.error = error;
                            })
                            .finally(function(){
                            });
                    }
                    loadProfile();

                    $scope.saveProfile = function saveProfile(editProfile) {
                        $scope.profile = editProfile;

                        if ($scope.profile.avatar) {
                            $scope.profile.avatar.rnd = Math.random(10).toString().substring(7);
                        }

                        var promise;
                        if (!$scope.profile.id) {
                            promise = profileService.create($scope.profile);
                        } else {
                            promise = profileService.update($scope.profile);
                        }

                        if($scope.profile.avatar.change) {

                                var avatarEdit;
                                if (!$scope.profile.avatar.id) {
                                    avatarEdit = avatarService.streams.create($scope.profile.id, 'avatar', $scope.profile.avatar.blob);
                                } else {
                                    avatarEdit = avatarService.streams.update($scope.profile.id, $scope.profile.avatar.blob);
                                }
                            

                        }

                        promise
                        .success(function () {
                            if($scope.profile.avatar.change){
                                avatarEdit
                                    .success(function(data, stream) {
                                        $scope.avatarData = data;
                                        $scope.avatarStream = stream;
                                    })
                                    .error(function(error) {
                                        $scope.error = error;
                                    })
                                    .finally(function (){

                                    });
                            }
                            if ($scope.onSaveFn) {
                                $scope.onSaveFn($scope.$parent);
                            }
                        })
                        .error(function (error) {
                            $scope.error = error.message;
                        })
                        .finally(function () {

                        });
                    };

                    $scope.saveCover = function () {
                        if($scope.file.filename) {
                            //$scope.$root.loader.suspend();
                            var coverId = $scope.profile.coverId;
                            var file = $scope.file.blob;
                            var addCover = function(path, file) {
                                return filesService.streams.create(path, file)
                                    .success(function(fileData) {
                                        angular.extend($scope.model, fileData);
                                        $scope.fileData = fileData;
                                        $scope.profile.coverRnd = Math.random(10).toString().substring(7);
                                        $scope.profile.coverId = $scope.fileData.id;
                                    })
                                    .finally(function(){
                                    });
                                },
                                updateCover = function(coverId, file) {
                                return filesService.streams.update(coverId, file)
                                    .success(function() {
                                        $scope.profile.coverRnd = Math.random(10).toString().substring(7);
                                    })
                                    .finally(function(){
                                    });
                                },
                                updateProfile = function() {
                                    return profileService.update($scope.profile)
                                    .success (function(data){
                                        $scope.updatedProfile = data;
                                        //$scope.$root.loader.resume();
                                    });
                                },
                                backToProfile = function() {
                                    $state.go('master.main.profile', {artistId: $state.params.artistId}, {reload:true});
                                };

                                loadProfile();
                                if($scope.profile.coverId) {
                                updateCover(coverId, file)
                                        .then(updateProfile)
                                        .then(backToProfile);
                                } else {
                                addCover(path, file)
                                    .then(updateProfile)
                                    .then(backToProfile);
                                }
                          }
                    };

                    $scope.cancelEdit = function cancelEdit() {
                        $state.go('master.main.profile', {artistId: $state.params.artistId});
                    };
                }

            ],
            templateUrl: 'templates/profile/template-profile-edit.html'
        };
    }
]);

}(angular));
