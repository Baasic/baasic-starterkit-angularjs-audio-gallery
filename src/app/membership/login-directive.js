(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('baasicLogin', ['$parse',
        function baasicLogin($parse) {
            var fn;
            return {
                restrict: 'AE',
                scope: false,
                compile: function (elem, attrs) {
                    fn = $parse(attrs.onLogin);
                },
                controller: ['$scope', '$state', 'baasicLoginService', 'baasicAuthorizationService',
                    function baasicLoginCtrl($scope, $state, loginService, authService) {

						var vm = {};
						$scope.vm = vm;
						vm.message = '';

						vm.user = {};
						vm.user.options = ['session', 'sliding'];

						(function(){
						if(authService.getAccessToken()){
							vm.isUserLoggedIn = true;
						}
						else{
							vm.isUserLoggedIn = false;
						}
						})();

                        $scope.goHome = function goHome() {
                            $state.go('master.main.index');
                        };

                        $scope.submitLogin = function submitLogin() {
                            $scope.$root.loader.suspend();
                            if ($scope.login.$valid) {
                                $scope.logging = true;
                                loginService.login({
                                    username: $scope.username,
                                    password: $scope.password,
                                })
                                .success(function (data) {
                                    authService.updateAccessToken(data);

                                    loginService.loadUserData()
                                        .success(function (data) {
                                            authService.resetPermissions();
                                            authService.updateUser(data);

                                            if (fn) {
                                                fn($scope);
                                            }
                                        })
                                        .error(function (data) {
                                            $scope.loginError = data.message;
                                        })
                                        .finally(function () {
                                            $scope.logging = false;
                                            $state.go('master.main.index');
                                        });

                                })
                                .error(function (data, status) {
                                    $scope.logging = false;

                                    switch (status) {
                                        case 400:
                                            if (data.error === 'invalid_grant') {
                                                $scope.loginError = 'Invalid email, username or password';
                                            } else {
                                                $scope.loginError = data.error_description; // jshint ignore:line
                                            }
                                            break;
                                        default:
                                            $scope.loginError = data.message;
                                            break;
                                        }

                                    })
                                .finally(function() {
                                    $scope.$root.loader.resume();
                                });
                                }

                        };
                    }
                ],
                templateUrl: 'templates/membership/template-login.html'
            };
        }
    ]);

}(angular));