(function(angular) {
    'use strict';

angular.module('media-gallery')
    .directive('albumAdd', ['$parse',
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
                        $scope.artistId = $state.params.artistId;
                        $scope.file = {filename: ''};
                        $scope.model = {};
                        var file;
                        var path;

                        //please login if not logged in
                        if (!$scope.$root.user.isAuthenticated) {
                            $state.go('master.main.login');
                        }

                        //back to profile page
                        $scope.backToDetails = function backToDetails() {
                            $state.go('master.main.profile', {artistId : $scope.$root.user.id});
                        };

                        //save album data and cover
                        $scope.saveAlbum = function(saveAlbum) {
                            $scope.album = saveAlbum;
                            $scope.album.rnd = Math.random(10).toString().substring(7);

                            var createAlbum = function() {
                                $scope.album.artistId = $scope.artistId;
                                return albumsService.create($scope.album)
                                    .success(function(album){
                                        $scope.album = album;
                                        $scope.albumId = $scope.album.id;
                                    })
                                    .error(function(error) {
                                        console.log(error); //jshint ignore: line
                                    })
                                    .finally(function() {
                                        getAlbum();
                                    });
                            };

                            var getAlbum = function() {
                                //if exist fetch me album data
                                if($scope.albumId) {
                                    albumsService.get($scope.albumId)
                                        .success(function (album) {
                                            $scope.album = album;
                                        })
                                        .error(function (error) {
                                            console.log(error); // jshint ignore: line
                                        })
                                        .finally(function(){
                                            addCoverStream();
                                        });
                                } else { //if not existant, make me empty object
                                    $scope.album = {};
                                }
                            };

                            var addCoverStream = function() {
                                file = $scope.file.blob;
                                if($scope.album.id){
                                    path = $scope.album.id + '/albumCover.jpg';
                                }
                                return filesService.streams.create(path, file)
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
                                        $scope.backToDetails();
                                    });
                            };

                            createAlbum();

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

                        $scope.deleteSong = function () {
                            /*pseudo code
                            delete playlist entry
                            delete stream(file)
                            */
                        };

                        $scope.cancelEdit = function () {
                            $scope.backToDetails();
                        };
                    };
                }],
                templateUrl: 'templates/album/template-album-add-form.html'
            };
        }
    ]);

}(angular));
