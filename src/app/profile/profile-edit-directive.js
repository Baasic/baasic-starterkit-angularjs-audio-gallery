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
            controller: ['$rootScope', '$scope', '$state', '$q', '$window', 'FileReader','baasicUserProfileService', 'baasicUserProfileAvatarService', '$timeout',
            function ($rootScope, $scope, $state, $q, $window, FileReader, profileService, avatarService, $timeout) {
                $scope.file = { filename: ''};
                $scope.model = {};
                $scope.artistId = $state.params.artistId;
                var profileExists;
                var avatarExists;
                $scope.hasImageSelected = false;
                $scope.invalidFileType = false;

                if (!$scope.$root.user.isAuthenticated) {
                    $state.go('master.main.profile', {artistId: $state.params.artistId});
                }

                function loadProfile() {
                    $scope.$root.loader.suspend();
                    profileService.get($scope.artistId, {
                        embed: 'avatar'
                    })
                    .success(function (profile) {
                        $scope.profile = profile;
                    })
                    .error(function (error) {
                        $scope.error = error;
                    })
                    .finally(function (){
                        var scope = $rootScope.$new();
                        scope.loader.resume();
                        if($scope.profile) {
                            if($scope.profile.avatar) {
                                avatarExists = true;
                            } else {
                                avatarExists = false;
                            }

                            profileExists = true;
                        } else {
                            profileExists = false;
                        }
                    });
                }

                loadProfile();

                $scope.saveProfile = function(profile) {
                    profile.id = $scope.artistId;

                    $scope.$root.loader.suspend();

                    // functions that can be performed
                    function backToProfile() {
                        $state.go('master.main.profile', {artistId: $scope.profile.id}, {reload:true});
                    }

                    function updateProfile() {
                        return profileService.update(profile)
                        .success (function(data){
                        })
                        .error (function(error){
                            $scope.error = error;
                        })
                        .finally (function(){
                            if($scope.hasImageSelected) {
                                checkAvatar();
                            } else {
                                $scope.$root.loader.resume();
                                backToProfile();
                            }
                        });
                    }

                    function createProfile() {
                        return profileService.create(profile)
                        .success (function(data){
                        })
                        .error (function(error){
                            $scope.error = error;
                        })
                        .finally (function(){
                            if($scope.hasImageSelected) {
                                checkAvatar();
                            } else {
                                $scope.$root.loader.resume();
                                backToProfile();
                            }
                        });
                    }

                    function updateAvatar() {
                        return avatarService.streams.update($scope.profile.id, $scope.profile.avatar.blob)
                        .success(function(data, stream) {
                            $scope.avatarData = data;
                            $scope.avatarStream = stream;
                        })
                        .error(function(error) {
                            $scope.error = error;
                        })
                        .finally(function (){
                            $scope.$root.loader.resume();
                            backToProfile();
                        });
                    }

                    function createAvatar() {
                        return avatarService.streams.create($scope.profile.id, 'avatar', $scope.profile.avatar.blob)
                        .success(function(data, stream) {
                            $scope.avatarData = data;
                            $scope.avatarStream = stream;
                        })
                        .error(function(error) {
                            $scope.error = error;
                        })
                        .finally(function (){
                            $scope.$root.loader.resume();
                            backToProfile();
                        });
                    }

                    function checkAvatar() {
                        if(avatarExists) {
                            updateAvatar();
                        }
                        else {
                            createAvatar();
                        }
                    }

                    if(profileExists) {
                        updateProfile();
                    } else {
                        createProfile();
                    }
                };

                $scope.previewSelectedImage = function previewSelectedImage() {
                    $timeout(function() {
                        ///check file type before uploading
                        if($scope.profile.avatar.blob.type === 'image/png' || $scope.profile.avatar.blob.type === 'image/jpeg' || $scope.profile.avatar.blob.type === 'image/jpg' ) {
                            $scope.invalidFileType = false;
                            $scope.hasImageSelected = true;
                            FileReader.readAsDataURL($scope.profile.avatar.blob, $scope)
                            .then(function(response){
                                $scope.selectedImage = response;
                            }, function(error) {
                                $scope.error = error;
                            });
                        }
                        else {
                            $scope.invalidFileType = true;
                        }
                        $scope.file = $scope.profile.avatar;
                    });
                };

                $scope.cancelEdit = function cancelEdit() {
                    if($scope.profile) {
                        $state.go('master.main.profile', {artistId: $scope.profile.id});
                    } else {
                        $state.go('master.main.index');
                    }

                };
            }
        ],
        templateUrl: 'templates/profile/template-profile-edit.html'
    };
}
]);

}(angular));
