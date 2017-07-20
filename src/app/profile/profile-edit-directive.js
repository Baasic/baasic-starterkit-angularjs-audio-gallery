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
                        if (!$scope.profile) {

                        }
                    });
                }

                loadProfile();

                /*TODO: avatar preview */


                $scope.saveProfile = function (editProfile) {
                    $scope.profile = editProfile;

                    //set var avatarEdit for use in functions later
                    var avatarEdit;

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
                    var saveAvatar = function() {
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
                        return profileService.update($scope.profile)
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

                    if($scope.profile.avatar) {
                        if($scope.profile.avatar.change) {
                            saveAvatar();
                        }
                    }

                    //update profile if no  avatar selected for upload
                    if($scope.profile.avatar) {
                        if(!$scope.profile.avatar.change) {
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
