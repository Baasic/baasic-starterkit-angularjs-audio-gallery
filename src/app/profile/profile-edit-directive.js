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
            controller: ['$scope', '$state', '$q', '$window', 'FileReader','baasicUserProfileService', 'baasicUserProfileAvatarService',
            function ($scope, $state, $q, $window, FileReader, profileService, avatarService) {
                $scope.file = { filename: ''};
                $scope.model = {};
                $scope.artistId = $state.params.artistId;
                var profileExists;
                var profileEdit;
                var avatarEdit;

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
                        if($scope.profile) {
                            profileExists = true;
                        } else {
                            profileExists = false;
                        }
                    });
                }

                loadProfile();

                $scope.saveProfile = function(profile) {
                    $scope.profile = profile;

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
                    //set promises for add or update profile
                    if(profileExists) {
                        profileEdit = profileService.update($scope.profile);
                    } else {
                        profileEdit = profileService.create($scope.profile);
                    }

                    // functions that can be performed
                    function saveAvatar() {
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
                    }

                    function updateProfile() {
                        return profileEdit
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
                    }

                    function backToProfile() {
                        $state.go('master.main.profile', {artistId: $state.params.artistId}, {reload:true});
                    }



                    if($scope.profile.avatar) {
                        if($scope.profile.avatar.change) {
                            saveAvatar();
                        } else {
                            updateProfile();
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
