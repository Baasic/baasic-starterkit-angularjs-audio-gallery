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
                controller: ['$scope', '$state', '$q', 'albumsService', 'baasicFilesService', 'baasicApp', 'FileReader', '$timeout',
                    function ($scope, $state, $q, albumsService, filesService, baasicApp, FileReader, $timeout) {
                        var app = baasicApp.get();
                        $scope.apiUrl = app.getApiUrl();  
                        $scope.hasImageSelected = false;                        
                        $scope.artistId = $state.params.artistId;
                        $scope.file = {filename: ''};
                        $scope.model = {};
                        $scope.invalidImageFileType = true;
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
                                        $scope.error = error;
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
                                            $scope.error = error;
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
                                    })
                                    .error(function(error){
                                        $scope.error = error;
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
                                            $scope.hasImageSelected = false;
                                        }
                                    })
                                    .error(function(error) {
                                        $scope.error = error;
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
                                        $scope.error = error;
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

                        $scope.previewSelectedImage = function previewSelectedImage() {
                            $timeout(function() {
                                if($scope.file.blob.type === 'image/png' || $scope.file.blob.type === 'image/jpeg' || $scope.file.blob.type === 'image/jpg' ) {                       
                                    $scope.invalidImageFileType = false;   
                                    $scope.hasImageSelected = true;        
                                    FileReader.readAsDataURL($scope.file.blob, $scope)
                                    .then(function(response){
                                        $scope.selectedImage = response;
                                    }, function(error) {
                                        $scope.error = error;
                                    });
                                }
                                else {
                                    $scope.invalidImageFileType = true;
                                }
                            });
                        };                      
                }],
                templateUrl: 'templates/album/template-album-add-form.html'
            };
        }
    ]);

}(angular));
