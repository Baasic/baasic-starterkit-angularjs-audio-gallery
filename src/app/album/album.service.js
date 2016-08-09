(function(angular) {
    'use strict';

    angular.module('media-gallery')
    .service('albumService', ['baasicApiHttp', 'baasicDynamicResourceService', function (baasicApiHttp, dynamicResourceService) {
        var resourceName = 'albums';

        this.get = function get(id, options) {
            return dynamicResourceService.get(resourceName, id, options);
        };

        this.find = function find(options) {
            return dynamicResourceService.find(resourceName, options);
        };

        this.create = function create(album) {
            return dynamicResourceService.create(resourceName, album);
        };

        this.update = function update(album) {
            album.createDate = new Date();
            return dynamicResourceService.update(album);
        };

        this.remove = function remove(album) {
            return dynamicResourceService.remove(album);
        };

        this.next = function next(dataList) {
            var nextLink = dataList.links('next');
            if (nextLink) {
                return baasicApiHttp.get(nextLink.href);
            }
        };

        this.previous = function previous(dataList) {
            var prevLink = dataList.links('previous');
            if (prevLink) {
                return baasicApiHttp.get(prevLink.href);
            }
        };

    }
    ]);

}(angular));