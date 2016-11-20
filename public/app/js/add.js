(function() {
  'use strict';

  angular
    .module('App')
    .directive('add', add);

  function add(){
    var directive = {
      restrict:'E',
      scope:{
      },
      templateUrl: '/templates/add.html',
      controller: Add,
      bindToController: true
    };

    return directive;
  };
  
  
  Add.$inject = ['$scope', 'dataAssistant'];

  function Add($scope, dataAssistant){
    $scope.files = [];
    
    $scope.setFiles = function(element) {
    $scope.$apply(function($scope) {
        console.log('add file');
        $scope.files = [];
        for (var i = 0; i < element.files.length; i++) {
          $scope.files.push(element.files[i])
        }
      $scope.progressVisible = false
      });
    };

    $scope.uploadFile = function(medianame, mediaprice) {
        var fd = new FormData()
        for (var i in $scope.files) {
            fd.append("uploadedFile", $scope.files[i])
        }
        fd.append('medianame', medianame);
        fd.append('mediaprice', mediaprice);

        var xhr = new XMLHttpRequest()
        xhr.upload.addEventListener("progress", uploadProgress, false)
        xhr.addEventListener("load", uploadComplete, false)
        xhr.addEventListener("error", uploadFailed, false)
        xhr.addEventListener("abort", uploadCanceled, false)
        xhr.open("POST", "/fileupload")
        $scope.progressVisible = true
        xhr.send(fd)
    }

    function uploadProgress(evt) {
        $scope.$apply(function(){
            if (evt.lengthComputable) {
                $scope.progress = Math.round(evt.loaded * 100 / evt.total)
            } else {
                $scope.progress = 'unable to compute'
            }
        })
    }

    function uploadComplete(evt) {
        /* This event is raised when the server send back a response */
        //alert(evt.target.responseText)
        $scope.$apply(function(){
          var result = JSON.parse(evt.target.responseText);
          if(result.status == 'ok')
          {
            $scope.result = result.message;
          } else {
            $scope.error = result.error;
          }
        });
    }

    function uploadFailed(evt) {
        $scope.error = "There was an error attempting to upload the file.";
    }

    function uploadCanceled(evt) {
        $scope.$apply(function(){
            $scope.progressVisible = false;
        });
        $scope.error = "The upload has been canceled by the user or the browser dropped the connection.";
    }
    
    
  }  
  
})();	