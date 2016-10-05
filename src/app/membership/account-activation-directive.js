angular.module('media-gallery')
    .directive('baasicAccountActivation', [
        function baasicAccountActivation() {
            'use strict';


            return {
                restrict: 'AE',
                scope: false,
                controller: ['$scope', '$state', '$stateParams', 'baasicRegisterService',
                    function AccountActivationController($scope, $state, $stateParams, baasicRegisterService) {
                        var vm = {};
                        $scope.vm = vm;

                        vm.message = 'Activating your account, please wait.';
                        (function(){
                            if($stateParams.activationToken) {

                                baasicRegisterService.activate({activationToken: $stateParams.activationToken})
                                .success(function(){
                                    vm.message = 'You have successfully activated your account! You will be redirected to login form in 5 seconds.';
                                    setTimeout(function(){
                                        $state.go('master.main.login');
                                    }, 5000);
                                })
                                .error(function (data, status) {
                                    vm.message = status + ': ' + data.message;
                                })
                                .finally(function() {

                                });
                            }
                            else {
                                vm.message = 'Activation token is required';
                            }
                        })();
                    }
                ],
                templateUrl: 'templates/membership/template-account-activation.html'
            };
        }
    ]);