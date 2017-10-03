(function(angular) {
    'use strict';

angular.module('media-gallery')
	.directive('baasicPasswordRecovery', [
		function baasicPasswordRecovery() {

		return {
			restrict: 'AE',
			scope: false,
			controller: ['$scope', '$state', 'baasicPasswordRecoveryService', 'baasicRecaptchaService',
				function($scope, $state, passwordRecoveryService, recaptchaService) {

					var vm = {};
					$scope.vm = vm;
					vm.message = '';
                    vm.messageType = '';

					vm.recoveryData = {};
					vm.recoveryData.challengeIdentifier = '';
					vm.recoveryData.challengeResponse = '';
					vm.recoveryData.recoverUrl = $state.href('master.main.password-change', {}, { absolute: true }) + '?passwordRecoveryToken={passwordRecoveryToken}';

					vm.recoverPassword = function() {
						vm.recoveryData.challengeIdentifier = recaptchaService.challenge();
						vm.recoveryData.challengeResponse = recaptchaService.response();

						if(vm.recoveryData.challengeResponse === '') {
							vm.message = 'Captcha code is required';
                            vm.messageType = 'alert';
							return;
						}

						passwordRecoveryService.requestReset(vm.recoveryData)
							.success(function() {
								vm.message = 'An email with a password change link has been sucessfully sent.';
                                vm.messageType = 'success';
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
			templateUrl: 'templates/membership/template-password-recovery.html'
		};
		}
	]);

}(angular));
