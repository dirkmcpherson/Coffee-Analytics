angular.module('analyticsApp').controller('ViewController', function($scope){
	$scope.globalTab = true; 
	$scope.individualTab = false; 

	$scope.showGlobal = function(){
		$scope.globalTab = true;
		$scope.individualTab = false;

		console.log('Switched to Global');
	}

	$scope.showIndividual = function(){
		$scope.globalTab = false;
		$scope.individualTab = true;

		console.log('Switched to Individual')
	}


})
