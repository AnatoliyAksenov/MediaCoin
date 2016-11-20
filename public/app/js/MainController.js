(function() {
  'use strict';

  angular
    .module('App')
    .controller('MainController', MainController);

    MainController.inject = ['$scope', 'dataAssistant'];

    function MainController($scope, dataAssistant) {
		$scope.user = {};

		$scope.profile = function(){
			dataAssistant.get('/profile').then(function(data){
				$scope.user.id = data.id;
				$scope.user.name = data.displayName;
				$scope.page = 'news';
				console.log('user:' + JSON.stringify(data));
			}, function(error){
				$scope.user_error = error;
				$scope.page = 'login';
			});
		};

		
      
		$scope.showNews = function(){
			$scope.page = 'news';
		};
		
		$scope.showAdd = function(){
			$scope.page = 'add';
		};
		
		$scope.showLogin = function(){
			$scope.page = 'login';
		};

		$scope.showList = function(){
			$scope.page = 'list';
		}
						
    }
})();