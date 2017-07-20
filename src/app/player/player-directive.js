(function(angular) {
    'use strict';

    angular.module('media-gallery')
    .directive('mediaPlayer', function(){

     return {
        restrict: 'AE',
        templateUrl:'templates/player/template-player.html',
        scope: '=',
        controller: ['$scope', '$state', '$stateParams', '$q', 'albumsService', 'baasicFilesService',
        function($scope, $state, $stateParams, $q, albumsService, filesService) {

            //playlist open/close
            $scope.playlistActive = false;
            $scope.playlistToggle = function() {
                $scope.playlistActive = !$scope.playlistActive;
            };

            //temporary songs for player
            $scope.songs = [
                /*{
                    id: 'one',
                    title: 'Valentine',
                    artist: 'nullSleep',
                    url: 'https://api.baasic.com/v1/audiogallery/file-streams/MzQSmWYIS2RAwjE5W9Cjg1',
                    cover: 'https://api.baasic.com/v1/audiogallery/file-streams/ryfVfhZlngRKxTF0WBrdC5'
                },
                {
                    id: 'two',
                    title: 'Chemical Wedding',
                    artist: 'Bruce Dickinson',
                    url: 'https://api.baasic.com/v1/audiogallery/file-streams/HH5KBUuVQKAg5API0CaJJ0',
                    cover: 'https://api.baasic.com/v1/audiogallery/file-streams/ryfVfhZlngRKxTF0WBrdC5'
                },*/
                {
                    id: 'three',
                    title: 'Barrlping with Carl (featureblend.com)',
                    artist: 'Akon',
                    url: 'http://www.freshly-ground.com/misc/music/carl-3-barlp.mp3',
                    cover: 'https://api.baasic.com/v1/audiogallery/file-streams/dSwctoxAyg52rjF5W82Gv3'
                },
                {
                    id: 'four',
                    title: 'Angry cow sound?',
                    artist: 'A Cow',
                    url: 'http://www.freshly-ground.com/data/audio/binaural/Mak.mp3',
                    cover: 'https://api.baasic.com/v1/audiogallery/file-streams/dSwctoxAyg52rjF5W82Gv3'
                },
                {
                    id: 'five',
                    title: 'Things that open, close and roll',
                    artist: 'Someone',
                    url: 'http://www.freshly-ground.com/data/audio/binaural/Things%20that%20open,%20close%20and%20roll.mp3',
                    cover: 'https://api.baasic.com/v1/audiogallery/file-streams/dSwctoxAyg52rjF5W82Gv3'
                }
            ];

            function addToPlaylist() {
                
            }

            function loadAlbums() {
                $scope.albums = [];

                albumsService.find({
                    page: 1,
                    rpp: 10,
                    search: $stateParams.artistId,
                    orderBy: 'releaseYear',
                    orderDirection : 'desc'
                })
                .success(function(data) {
                    $scope.albums = data.item;

                    $scope.pagerData = {
                        currentPage: data.page,
                        pageSize: data.recordsPerPage,
                        totalRecords: data.totalRecords
                    };
                })
                .error(function(error) {
                        console.log(error); // jshint ignore: line
                    })
                .finally(function() {
                    $scope.$parent.albums = $scope.albums;
                    $scope.firstAlbum = $scope.albums[0];
                    loadAlbumCovers();
                });
            }

            loadAlbums();

            function loadAlbumCovers() {
                filesService.find({
                    search: $scope.firstAlbum.coverPath
                })
                .success(function(data) {
                    $scope.firstAlbum.coverUrl = data.item[0].links('stream-token').href;
                })
                .error(function(error) {
                    console.log(error); // jshint ignore: line
                });
            }


        }],
    };
});

}(angular));
