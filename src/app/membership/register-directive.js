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
										vm.message = 'Captcha code is required!';
										return;
									}

									registerService.create(vm.user)
										.success(function() {
											vm.message = 'You have successfully registered, please check you email in order to finish registration process';
                                            /*To do: create profile and make it active:false; */
										})
										.error(function(data, status) {
											vm.message = status + ': ' + data.message;
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
