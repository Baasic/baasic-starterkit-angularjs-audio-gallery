/* global angular */
angular.module('media-gallery', [
    'ui.router',
    'ngAnimate',
    'smoothScroll',
    'baasic.security',
    'baasic.membership',
    'baasic.files',
    'baasic.userProfile',
    'file-model',
    'baasic.dynamicResource'
])
    .config(['$locationProvider', '$urlRouterProvider', '$stateProvider', 'baasicAppProvider', 'baasicAppConfigProvider',
        function config($locationProvider, $urlRouterProvider, $stateProvider, baasicAppProvider, baasicAppConfigProvider) {
            'use strict';

            baasicAppProvider.create(baasicAppConfigProvider.config.apiKey, {
                apiRootUrl: baasicAppConfigProvider.config.apiRootUrl,
                apiVersion: baasicAppConfigProvider.config.apiVersion
            });

            $locationProvider.html5Mode({
                enabled: true
            });

            $urlRouterProvider.when('', '/');

            $urlRouterProvider.otherwise(function ($injector) {
                var $state = $injector.get('$state');
                $state.go('master.404');
            });

            $urlRouterProvider.rule(function ($injector, $location) {
                var path = $location.path();

                // check to see if the path ends in '/'
                if (path[path.length - 1] === '/') {
                    $location.replace().path(path.substring(0, path.length - 1));
                }
            });

            $stateProvider
                .state('master', {
                    abstract: true,
                    url: '/',
                    templateUrl: 'templates/master.html'
                })
                .state('master.main', {
                    abstract: true,
                    templateUrl: 'templates/main.html',
                    controller: 'MainCtrl'
                })
                .state('master.login', {
                    url: 'login',
                    templateUrl: 'templates/membership/login.html',
                    controller: 'LoginCtrl'
                })
                .state('master.register', {
                    url: 'register',
                    templateUrl: 'templates/membership/register.html'
                })
                .state('master.password-change', {
                    url: 'password-change?passwordRecoveryToken',
                    templateUrl: 'templates/membership/password-change.html'
                })
                .state('master.password-recovery', {
                    url: 'password-recovery',
                    templateUrl: 'templates/membership/password-recovery.html'
                })
                .state('master.account-activation', {
                    url: 'account-activation?activationToken',
                    templateUrl: 'templates/membership/account-activation.html',
                    controller: 'AccountActivationCtrl'
                })
                .state('master.main.profile', {
                    url: 'artist/{artistId}',
                    templateUrl: 'templates/profile/profile-detail.html'
                })
                .state('master.main.profile-edit', {
                    url: 'artist/edit/{artistId}',
                    templateUrl: 'templates/profile/profile-edit.html'
                })
                .state('master.main.profile-add', {
                    url: 'artist/add/{userId}',
                    templateUrl: 'templates/profile/profile-edit.html'
                })
                .state('master.main.index', {
                    url: '?{page}',
                    templateUrl: 'templates/profile/profile-list.html'
                })
                .state('master.main.edit-album', {
                    url: 'edit-album/{albumId}',
                    templateUrl: 'templates/album/album-edit.html'
                })
                .state('master.main.add-song', {
                    url: 'new-song',
                    templateUrl: 'templates/gallery/new-song.html'
                })
                .state('master.main.edit-song', {
                    url: 'edit-song/{slug}',
                    templateUrl: 'templates/gallery/edit-song.html'
                })
                .state('master.main.search', {
                    url: 'search?{search,type}',
                    templateUrl: 'templates/gallery/search-results.html',
                    controller: 'SearchResultsCtrl'
                })
                .state('master.404', {
                    templateUrl: 'templates/404.html'
                });
        }
    ])
    .constant('recaptchaKey', '6LfcryYTAAAAAO0KBx1Cj6yNnSSjbB2MHTchdWac')
    .controller('MainCtrl', ['$scope', '$state', '$rootScope', '$browser',
        function MainCtrl($scope, $state, $rootScope, $browser) {
            'use strict';

            // http://stackoverflow.com/questions/8141718/javascript-need-to-do-a-right-trim
            var rightTrim = function (str, ch) {
                if (!str) {
                    return '';
                }
                for (var i = str.length - 1; i >= 0; i--) {
                    if (ch !== str.charAt(i)) {
                        str = str.substring(0, i + 1);
                        break;
                    }
                }
                return str ? str : '';
            };

            $rootScope.baseHref = rightTrim($browser.baseHref.href, ('/'));
            if ($rootScope.baseHref === '/') {
                $rootScope.baseHref = '';
            }

            $scope.setEmptyUser = function setEmptyUser() {
                $scope.$root.user = {
                    isAuthenticated: false
                };
            };
        }
    ])
    .controller('LoginCtrl', ['$scope', '$state',
        function LoginCtrl($scope, $state) {
            'use strict';

            $scope.goHome = function goHome() {
                $state.go('master.main.index');
            };
        }
    ])
    .controller('SearchCtrl', ['$scope', '$state', function ($scope, $state) {
        'use strict';
        $scope.searchNature = function () {
            $state.go('master.main.photo-search', { search: $scope.searchFor, type: 'nature' });
        };

        $scope.searchPeople = function () {
            $state.go('master.main.photo-search', { search: $scope.searchFor, type: 'people' });
        };

        $scope.searchCitiesAndVillages = function () {
            $state.go('master.main.photo-search', { search: $scope.searchFor, type: 'cities-and-villages' });
        };

    }])
    .run(['$rootScope', '$window', 'baasicAuthorizationService',
        function moduleRun($rootScope, $window, baasicAuthService) {
            'use strict';

            var token = baasicAuthService.getAccessToken();
            var userDetails;
            if (token) {
                userDetails = baasicAuthService.getUser();
            }

            var user;
            if (userDetails !== undefined && userDetails !== null) {
                user = {
                    isAuthenticated: true,
                    isAdmin: userDetails.roles.indexOf('Administrators') !== -1
                };

                angular.extend(user, userDetails);
            } else {
                user = {
                    isAuthenticated: false
                };
            }

            $rootScope.user = user;
        }
    ]);