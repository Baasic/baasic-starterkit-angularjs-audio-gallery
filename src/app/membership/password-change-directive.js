(function(angular) {
    'use strict';

angular.module('media-gallery')
	.directive('baasicPasswordChange', [
		function baasicPasswordChange() {

			return {
				restrict: 'AE',
				scope: false,
				controller: ['$scope', '$stateParams', '$state', 'baasicPasswordRecoveryService',
					function($scope, $stateParams, $state, passwordRecoveryService) {

					var vm= {};
					$scope.vm = vm;
                    $scope.passwordRegex = '^(?=.*?[A-Za-z0-9])(?=.*?[#?!@$%^&*-]).{8,}$';
					vm.resetData = {};
					vm.resetData.passwordRecoveryToken = $stateParams.passwordRecoveryToken;
					vm.resetData.newPassword = '';
					vm.resetData.confirmPassword = '';

					vm.changePassword = function() {
						if(vm.resetData.newPassword !== vm.resetData.confirmPassword) {
							vm.message = 'Password and Confirm Password must match';
                            vm.messageType = 'alert';
							return;
						} else {
                            $scope.$root.loader.suspend();
                        }

						passwordRecoveryService.reset(vm.resetData)
							.success(function() {
             					vm.message = 'You have successfully changed your password, you will be redirected to login form in 5 seconds';
                                vm.messageType = 'success';
                                setTimeout(function(){
                                    $state.go('master.main.login');
                                }, 5000);
							})
							.error(function(data, status){
                                var statusNumbers = {
                                    '400' : 'Bad Request - System does not understand your request',
                                    '401' : 'Requested action requires authenthication',
                                    '403' : 'System refuses to fullfil requested action',
                                    '404' : 'Specified user does not exist in the system',
                                    '409' : 'Request action could not be carried out because of the conflict in the system',
                                    '500' : 'Internal server error, this is on server side, please contact support'
                                };
                                vm.message = statusNumbers[status];
                                vm.messageType = 'error';
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

}(angular));
