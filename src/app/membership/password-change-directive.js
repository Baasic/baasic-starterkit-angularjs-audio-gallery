angular.module('media-gallery')
	.directive('baasicPasswordChange', [
		function baasicPasswordChange() {
			'use strict';

			return {
				restrict: 'AE',
				scope: false,
				controller: ['$scope', '$stateParams', '$state', 'baasicPasswordRecoveryService',
					function($scope, $stateParams, $state, passwordRecoveryService) {

					var vm= {};
					$scope.vm = vm;

					vm.resetData = {};
					vm.resetData.passwordRecoveryToken = $stateParams.passwordRecoveryToken;
					vm.resetData.newPassword = '';
					vm.resetData.confirmPassword = '';

					vm.changePassword = function() {
						if(vm.resetData.newPassword !== vm.resetData.confirmPassword) {
							vm.message = 'Password and Confirm Password must match';
							return;
						}

						passwordRecoveryService.reset(vm.resetData)
							.success(function() {
             					vm.message = 'You have successfully changed your password, you will be redirected to login form in 5 seconds';
                                setTimeout(function(){
                                    $state.go('login');
                                }, 5000);
							})
							.error(function(data, status){
								vm.message = status + ': ' + data.message;
							})
							.finally(function () {
								$scope.$root.loader.resume();

							});
					};
					}
				],
				templateUrl: 'templates/membership/template-password-change.html'
			};
		}
	]);