angular.module('media-gallery')
    .service('profileService', ['baasicApiHttp', 'baasicUserProfileService',
        function profileService(baasicApiHttp, baasicUserProfileService) {
            'use strict';

            this.get = function get(id, options) {
                return baasicUserProfileService.get(id, options);
            };

            this.find = function find(options) {
                return baasicUserProfileService.find(options);
            };

            this.create = function create(options) {
                return baasicUserProfileService.create(options);
            };

            this.update = function update(options) {
                return baasicUserProfileService.update(options);
            };

            this.next = function next(profileList) {
                var nextLink = profileList.links('next');
                if (nextLink) {
                    return baasicApiHttp.get(nextLink.href);
                }
            };

            this.previous = function previous(profileList) {
                var prevLink = profileList.links('previous');
                if (prevLink) {
                    return baasicApiHttp.get(prevLink.href);
                }
            };
        }
    ]);