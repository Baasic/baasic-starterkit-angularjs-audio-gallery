angular.module('media-gallery').provider('baasicAppConfig', function () {
    'use strict';
    this.config = {
        apiKey: '<apiKey>',
        apiRootUrl: '<apiRootUrl>',
        apiVersion: '<apiVersion>'
    };
    this.$get = function () {
    };
});