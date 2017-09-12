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
                        $scope.hasFileSelected = false;
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

                            function createAlbum() {
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
                            }

                            function getAlbum() {
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
                            }

                            function addCoverStream() {
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
                            }

                            function getCoverData() {
                                filesService.find(path)
                                    .success(function(coverData){
                                        $scope.coverData = coverData.item[0];
                                        if(!$scope.album.coverId) {
                                            $scope.album.coverId = $scope.coverData.id;
                                            $scope.hasFileSelected = false;
                                        }
                                    })
                                    .error(function(error) {
                                        console.log(error); //jshint ignore: line
                                    })
                                    .finally(function(){
                                        updateAlbum();
                                    });
                            }
                            function updateAlbum() {
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
                            }

                            createAlbum();
                        };

                        $scope.cancelEdit = function () {
                            $scope.backToDetails();
                        };

                        $scope.logTheScope = function () {
                            console.log($scope);
                        };

                        $scope.refreshSelectedImage = function() {
                            var img = $scope.file;
                            console.log($scope.file);
                            console.log($scope.file.filename);
                            console.log($scope.file);
                            var url = (window.URL || window.webkitURL).createObjectURL(img);
                            $scope.imgSrc = url;
                            $scope.hasFileSelected = true;
                        };                        
                }],
                templateUrl: 'templates/album/template-album-add-form.html'
            };
        }
    ]);

}(angular));
