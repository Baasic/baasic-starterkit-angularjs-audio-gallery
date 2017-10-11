(function(angular) {
    'use strict';

angular.module('media-gallery')
	.directive('baasicRegistration', ['$parse',
		function baasicRegistration($parse) {

			var fn;

			return {
				restrict: 'AE',
				scope: false,
				compile: function (elem, attrs) {
					fn = $parse(attrs.onRegister);
				},
					controller: ['$scope','$state', 'baasicRegisterService', 'baasicRecaptchaService',
						function RegisterCtrl($scope, $state, registerService, recaptchaService) {

							var vm = {};
							$scope.vm = vm;

							vm.message = '';
                            vm.messageType = '';

							vm.user = {};
							vm.user.activationUrl = $state.href('master.main.account-activation', {}, {absolute: true}) + '?activationToken={activationToken}';
							vm.user.creationDate = new Date();
							vm.user.challengeIdentifier = '';
							vm.user.challengeResponse = '';

							vm.register = function() {
								if($scope.registrationForm.$valid) {
									vm.user.challengeIdentifier = recaptchaService.challenge();
									vm.user.challengeResponse = recaptchaService.response();

									if(vm.user.challengeResponse === '') {
										vm.message = 'Captcha is required! Confirm that you are not robot!';
                                        vm.messageType = 'alert';
										return;
									}
									$scope.$root.loader.suspend();
									registerService.create(vm.user)
										.success(function() {
											vm.message = 'You have successfully registered, please check you email in order to finish registration process';
                                            vm.messageType = 'success';
										})
										.error(function(data, status) {
										    var statusNumbers = {
                                                '400' : 'Bad Request - Please check Captcha challenge request',
                                                '401' : 'Requested action requires authenthication',
                                                '403' : 'System refuses to fullfil requested action, registration may be disabled',
                                                '409' : 'Email or username is already registered in system',
                                                '500' : 'Internal server error, this is on server side, please contact support'
                                            };

                                            vm.message = statusNumbers[status];
                                            vm.messageType = 'error';
											recaptchaService.reload();
										})
										.finally(function () {
											$scope.$root.loader.resume();
										});
								}
							};
						}
					],
					templateUrl: 'templates/membership/template-register.html'
			};
		}
	]);

}(angular));
