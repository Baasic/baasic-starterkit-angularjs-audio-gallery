(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('baasicAccountActivation', [
        function baasicAccountActivation() {

            return {
                restrict: 'AE',
                scope: false,
                controller: ['$scope', '$state', '$stateParams', 'baasicRegisterService',
                    function AccountActivationController($scope, $state, $stateParams, baasicRegisterService) {
                        var vm = {};
                        $scope.vm = vm;

                        vm.message = 'Activating your account, please wait.';
                        vm.messageType = '';
                        (function(){
                            if($stateParams.activationToken) {

                                baasicRegisterService.activate({activationToken: $stateParams.activationToken})
                                .success(function(){
                                    vm.message = 'You have successfully activated your account! You will be redirected to login form in 5 seconds.';
                                    vm.messageType = 'success';
                                    setTimeout(function(){
                                        $state.go('master.main.login');
                                    }, 5000);
                                })
                                .error(function (data, status) {
                                    var statusNumbers = {
                                        '400' : 'Bad Request - System does not understand your request',
                                        '401' : 'Requested action requires authenthication',
                                        '403' : 'System refuses to fullfil requested action',
                                        '404' : 'Activation token already used or invalid',
                                        '409' : 'Account already activated',
                                        '500' : 'Internal server error, this is on server side, please contact support'
                                    };
                                    vm.message = statusNumbers[status];
                                    vm.messageType = 'error';
                                })
                                .finally(function() {

                                });
                            }
                            else {
                                vm.message = 'Activation token is required';
                                vm.messageType = 'alert';
                            }
                        })();
                    }
                ],
                templateUrl: 'templates/membership/template-account-activation.html'
            };
        }
    ]);

}(angular));
