(function(angular) {
    'use strict';

    angular.module('media-gallery')
    .service('filesService', ['baasicApiHttp', 'baasicFilesService',
        function (baasicApiHttp, filesService) {

            this.get = function get(id, options) {
                return filesService.get(id, options);
            };

            this.find = function find(options) {
                return filesService.find(options);
            };

            this.create = function create(file) {
                return filesService.create(file);
            };

            this.update = function update(data) {
                data.createDate = new Date();
                return filesService.update(data);
            };

            this.remove = function remove(data, options) {
                return filesService.remove(data, options);
            };

            this.streamGet = function streamGet(data) {
                return filesService.streams.get(data);
            };

            this.streamUpdate = function streamUpdate(data, stream) {
                return filesService.streams.update(data, stream);
            };

            this.streamCreate = function streamCreate(data, stream) {
                return filesService.streams.create(data, stream);
            };

            this.batchUpdate = function batchUpdate(data) {
                return filesService.batch.update(data);
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

/*

files.get ili files.find
{
properties (id, date created, date updated itd)
links: ("stream-token") link do media
}

files.find(){
    _.each(item){
    item.links("stream-token").href
}
}

*/