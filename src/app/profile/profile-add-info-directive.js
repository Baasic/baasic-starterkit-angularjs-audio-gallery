(function(angular) {
    'use strict';

    angular.module('media-gallery')
    .directive('profileAddInfo', ['$parse',
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
            controller: ['$scope', '$state', '$q', '$window', 'baasicUserProfileService', 'baasicUserProfileAvatarService', 'baasicFilesService',
            function ($scope, $state, $q, $window, profileService, avatarService, filesService) {
                $scope.file = { filename: ''};
                $scope.model = {};
                $scope.artistId = $state.params.artistId;

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
                    .success(function (cover) {
                        $scope.cover = cover;
                    })
                    .error(function (error){
                        $scope.error = error;
                    })
                    .finally(function(){
                    });
                }

                $scope.saveProfile = function (saveProfile) {
                    $scope.profile = saveProfile;
                    $scope.profile.id = $scope.artistId;

                    //set some stuff up for next actions
                    var path = $scope.artistId + '/profileCover.jpg';
                    var coverId = $scope.profile.coverId;
                    var file;
                    var avatarEdit;

                    //set profile cover image file to scope if exists
                    if($scope.file.filename) {
                        file = $scope.file.blob;
                    }

                    //set promises for add or update avatar
                    if($scope.profile.avatar) {
                        if($scope.profile.avatar.change){
                            $scope.profile.avatar.rnd =  Math.random(10).toString().substring(7);
                            if ($scope.profile.avatar.id) {
                                avatarEdit = avatarService.streams.update($scope.profile.id, $scope.profile.avatar.blob);
                            } else {
                                avatarEdit = avatarService.streams.create($scope.profile.id, 'avatar', $scope.profile.avatar.blob);
                            }
                        }
                    }
                    // functions that can be performed
                    var addCover = function(path, file) {
                        $scope.profile.coverRnd = Math.random(10).toString().substring(7);
                        return filesService.streams.create(path, file)
                        .success(function(fileData) {
                            angular.extend($scope.model, fileData);
                            $scope.fileData = fileData;
                            $scope.profile.coverId = $scope.fileData.id;
                        })
                        .error(function(error) {
                            console.log(error); // jshint ignore: line
                        })
                        .finally(function(){
                            if($scope.profile.avatar) {
                                if(!$scope.profile.avatar.change) {
                                    updateProfile();
                                }
                            }
                        });
                    },
                    updateCover = function(coverId, file) {
                        $scope.profile.coverRnd = Math.random(10).toString().substring(7);
                        return filesService.streams.update(coverId, file)
                        .success(function() {
                        })
                        .error(function(error) {
                            console.log(error); // jshint ignore: line
                        })
                        .finally(function(){
                            if($scope.profile.avatar) {
                                if(!$scope.profile.avatar.change) {
                                    updateProfile();
                                }
                            }
                        });
                    },
                    saveAvatar = function() {
                        return avatarEdit
                        .success(function(data, stream) {
                            $scope.avatarData = data;
                            $scope.avatarStream = stream;
                        })
                        .error(function(error) {
                            console.log(error); //jshint ignore: line
                        })
                        .finally(function (){
                            updateProfile();
                        });
                    },
                    backToProfile = function() {
                        $state.go('master.main.profile', {artistId: $state.params.artistId}, {reload:true});
                    },
                    updateProfile = function() {
                        return profileService.create($scope.profile, {
                            embed: 'avatar'
                        })
                        .success (function(data){
                            $scope.profile = data;
                        })
                        .error (function(error){
                            console.log(error); //jshint ignore: line
                        })
                        .finally (function(){
                            loadProfile();
                            backToProfile();
                        });
                    };

                    //actions to do when you choose image for profile cover
                    if($scope.file.filename) {
                        //$scope.$root.loader.suspend();
                        if($scope.profile.coverId) {
                            updateCover(coverId, file);
                        } else {
                            addCover(path, file);
                        }

                    }
                    if($scope.profile.avatar) {
                        if($scope.profile.avatar.change) {
                            saveAvatar();
                        }
                    }

                    //update profile if no cover or avatar selected for upload
                    if(!$scope.file.filename || !$scope.profile.avatar) {
                        updateProfile();
                    }
                };

                $scope.cancelEdit = function cancelEdit() {
                    $state.go('master.main.profile', {artistId: $state.params.artistId});
                };
            }
        ],
        templateUrl: 'templates/profile/template-profile-add-info.html'
    };
}
]);

}(angular));
