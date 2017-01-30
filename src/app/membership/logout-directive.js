(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('baasicLogout', ['$parse',
        function baasicLogout($parse) {
            var fn;
            return {
                restrict: 'AE',
                scope: false,
                compile: function (elem, attrs) {
                    fn = $parse(attrs.onLogout);
                },
                controller: ['$scope', '$state', 'baasicLoginService', 'baasicAuthorizationService',
                    function baasicLogoutCtrl($scope, $state, loginService, authService) {
                        function clearUser() {
                            authService.setUser(null);
                            authService.updateAccessToken(null);

                            if (fn) {
                                fn($scope);
                            }
                            $state.go('master.main.index');
                        }
                        var storageKey = 'socialData';
                        var storeSocialLoginData = function(data){
                            if (!data){
                                localStorage.setItem(storageKey, null);
                            } else {
                                localStorage.setItem(storageKey, JSON.stringify(data));
                            }
                        };

                        $scope.logout = function logout() {
                            var token = authService.getAccessToken();
                            if (token) {
                                loginService.logout(token.access_token, token.token_type) // jshint ignore:line
                                    .success(function socialLogin() {
                                         // clear social login provider data

                                        socialLogin.notification = '';
                                        socialLogin.showCredentials = false;
                                        socialLogin.inProgress = false;
                                        socialLogin.providerData = undefined;
                                        storeSocialLoginData(null);
                                        })
                                    .finally(clearUser);
                            } else {
                                clearUser();
                            }
                        };
                    }
                ],
            };
        }
    ]);

}(angular));