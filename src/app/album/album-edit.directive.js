(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('albumEdit', ['$parse',
        function albumList($parse) {

            return {
                restrict: 'AE',
                scope: true,
                replace: true,
                compile: function () {
                    return {
                        pre: function (scope, elem, attrs) {
                            if (attrs.onSave) {
                                scope.onSaveFn = $parse(attrs.onSave);
                            }
                            if (attrs.onCancel) {
                                scope.onCancelFn = $parse(attrs.onCancel);
                            }
                        }
                    };
                },
                controller: ['$scope', '$state', '$q', 'albumsService', 'baasicFilesService',
                    function ($scope, $state, $q, albumsService, filesService) {
                        $scope.albumId = $state.params.albumId;
                        $scope.file = {filename: ''};
                        $scope.model = {};
                        var file;
                        var path = $scope.albumId + '/albumCover.jpg';

                        //please login if not logged in
                        if (!$scope.$root.user.isAuthenticated) {
                            $state.go('master.main.login');
                        }

                        //back to profile page
                        $scope.backToDetails = function backToDetails() {
                            $state.go('master.main.profile', {artistId : $scope.$root.user.id});
                        };

                        //get me selected album
                        function getAlbum() {
                            albumsService.get($scope.albumId)
                                .success(function (album) {
                                    $scope.album = album;
                                })
                                .error(function (error) {
                                    console.log(error); // jshint ignore: line
                                })
                                .finally(function(){
                                });
                        }
                        getAlbum();

                        $scope.saveAlbum = function(saveAlbum) {
                            $scope.album = saveAlbum;
                            $scope.album.rnd = Math.random(10).toString().substring(7);

                            var updateCoverStream = function() {
                                file = $scope.file.blob;
                                return filesService.streams.update(path, file)
                                    .success(function() {
                                        console.log ('stream uploaded successfuly'); // jshint ignore: line
                                    })
                                    .error(function(error){
                                        console.log(error); //jshint ignore: line
                                    })
                                    .finally(function() {
                                        getCoverData();
                                    });
                            };
                            var getCoverData = function() {
                                filesService.find(path)
                                    .success(function(coverData){
                                        $scope.coverData = coverData.item[0];
                                        if(!$scope.album.coverId) {
                                            $scope.album.coverId = $scope.coverData.id;
                                        }
                                    })
                                    .error(function(error) {
                                        console.log(error); //jshint ignore: line
                                    })
                                    .finally(function(){
                                        updateAlbum();
                                    });
                            };

                            var updateAlbum = function() {
                                return albumsService.update($scope.album)
                                    .success(function(album){
                                        if(album){
                                            $scope.album = album;
                                        }
                                    })
                                    .error(function(error) {
                                        console.log(error); //jshint ignore: line
                                    })
                                    .finally(function() {
                                        loadAlbum();
                                    });
                            };

                            var loadAlbum = function() {
                                return albumsService.get($scope.album.id)
                                    .success(function(){
                                    })
                                    .error(function(error){
                                        console.log(error); //jshint ignore: line
                                    })
                                    .finally(function(){
                                        $scope.backToDetails();
                                    });
                            };

                            if($scope.file.blob) {
                                updateCoverStream();
                            } else {
                                updateAlbum();
                            }
                        };

                        $scope.cancel = function () {
                            $state.go('master.main.profile', {artistId: $scope.artistId}, {reload:true});
                        };

                        //this i'll do later
                        $scope.addSong = function () {
                            /*pseudo code
                            upload stream
                            add playlist entry
                            */
                        };

                        $scope.deleteSong = function ($index) {
                            var songIndex = $index;
                            var songId;
                            var findSong = function(songIndex){
                                var songId = $scope.playlist[songIndex].id;
                                $scope.album.playlist.splice($scope.playlist[songIndex], 1);
                                filesService.remove(songId)
                                .success(function(data){
                                    $scope.songData = data;
                                    console.log('succesfully deleted song'); //jshint ignore: line
                                })
                                .finally(function(){
                                    removeSong();
                                });
                            };
                            var removeSong = function(){
                                filesService.remove($scope.songData)
                                .success(function(){
                                    console.log('song successfully deleted'); //jshint ignore: line
                                })
                                .finally(function(){
                                    updatePlaylist();
                                });
                            };
                            var updatePlaylist = function(){
                                albumsService.update($scope.album)
                                .success(function(album){
                                    $scope.album = album;
                                });
                            };

                        findSong(songIndex);
                        };

                        $scope.cancelEdit = function () {
                            $scope.backToDetails();
                        };
                    }
                ],
                templateUrl: 'templates/album/template-album-edit-form.html'
            };
        }
    ]);

}(angular));
