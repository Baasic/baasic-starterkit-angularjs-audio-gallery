angular.module('media-gallery')
	.controller('AccountActivationCtrl',['$scope', '$state','$stateParams', 'baasicRegisterService',
		function AccountActivationController($scope, $state, $stateParams, baasicRegisterService) {
			'use strict';

			var vm = {};
			$scope.vm = vm;

			vm.message = 'Activating your account, please wait.';
			(function(){
				if($stateParams.activationToken) {
					baasicRegisterService.activate({activationToken: $stateParams.activationToken})
						.success(function(){
							vm.message = 'You have successfully activated your account! You will be redirected to login form in 5 seconds.';
                            setTimeout(function(){
                                    $state.go('login');
                                }, 5000);
						})
						.error(function (data, status) {
							vm.message = status + ': ' + data.message;
						});
				}
				else {
					vm.message = 'Activation token is required';
				}
			})();
		}
	]);