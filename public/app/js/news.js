(function() {
  'use strict';

  angular
    .module('App')
    .directive('news', news);

  function news(){
    var directive = {
      restrict:'E',
      scope:{
      },
      templateUrl: '/templates/news.html',
      controller: News,
      bindToController: true
    };

    return directive;
  };
  
  
  News.$inject = ['$scope', 'dataAssistant'];

  function News($scope, dataAssistant){
    $scope.news = [];

    $scope.newsInit = function(){
      $scope.news.push({
        title: "New York sounds",
        body: "Hi, Guys! ",
        link: 'http://yandex.ru/'
      });  
      $scope.news.push({
        title: "Moscow sounds",
        body: "Pryvet from Moscow!!! ",
        link: 'http://google.com/'
      });
    };
  }  
  
})();