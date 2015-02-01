var app = angular.module('analyticsApp',['ngResource'])
var port = 1337; 

app.config(['$httpProvider' , function($httpProvider){
	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
} ] );

app.factory('UserFactory', function($resource){
	return $resource("http\://localhost\:3000/user", {}, {
		get : { method:'GET' , isArray:true}
	});
});

app.factory('LikeFactory', function($resource){
	return $resource("http\://localhost\:3000/like/\:source/\:target", {source : '', target : '' }, {
		get : {method:'GET' , isArray : true}
	})
})

app.factory('ConversationFactory', function($resource){
	return $resource('http://localhost:3000/user/:userId/conversation', {userId:''} , {
		get : {method:'GET' , isArray : false}
	})
})

//retrieves all messages by a user or to a user
app.factory('MessageFactory', function($resource){
	return $resource('http://localhost:3000/message/:id', {id:''} , {
		get : {method:'GET' , isArray : false}
	})
})

app.controller('AnalyticsController', function($scope, $resource, UserFactory, LikeFactory, ConversationFactory, MessageFactory){

	$scope.users = [];
	$scope.focusedUser = {}; 
	$scope.averageMessages = 0; 
	$scope.completeUsers = 0; 
	$scope.totalSwipes = 0;
	$scope.totalLikes = 0; 
	$scope.totalMatches = 0; 

	//search for a single user
	$scope.searchUser = function( userId ){
		if( users.length > 0 ){
			$scope.focusedUser
		}
	}

	$scope.getNumViews = function( user ){
		if( user.hasOwnProperty('viewedUsers') ){
			return user.viewedUsers.length;
		}
		return 0; 
	}

	$scope.getAverageViews = function(){ //rounded to whole numbers
		var sum = 0
		$scope.users.forEach(function(user) {
			sum += $scope.getNumViews(user);
		});
		return sum/$scope.users.length;
	}


	//Use likes to get a permanent measure of matches
	//loop through a users viewedUsers array and count how many have mutually liked each other
	$scope.populateLikesAndMatches = function(user){
		if( !user ){ return 0 } //dont query if the users aren't populated yet 

		user.matches = 0; 
		user.likes = 0; 

		$scope.totalSwipes += user.viewedUsers.length; 

		if( user.viewedUsers.length > 0 ){
			user.viewedUsers.forEach(function(other){

				//ugly and slow: check if the user has liked the viewed and the viewed has liked the user TODO: do this as your its own route
				LikeFactory.get({source:user._id , target:other}).$promise.then(function( forward ){
					if( forward.length > 0  ){
						user.likes++; $scope.totalLikes++; 
						LikeFactory.get({source:other , target:user._id}).$promise.then(function( backward ){
							if(backward.length > 0 ){ user.matches++; $scope.totalMatches++ }
						})
					}
				})
			})
		}
		return 
	}


	//populate user field with the number of conversations and the average number of messages per conversation 
	$scope.populateAverageMessages = function( user ){
		if( !user ){ return }

		user.averageMessages = 0;
		user.conversation = 0; 

		MessageFactory.get({id:user._id}).$promise.then( function(res){
			user.averageMessages += res.data.length;
			ConversationFactory.get({userId:user._id}).$promise.then( function( convoList ){
				user.conversation = convoList.data.length > 0 ? convoList.data.length : 1;  //prevent divide by 0 
				user.averageMessages /= user.conversation;
				$scope.averageMessages += user.averageMessages;
			})
		})
	}

	$scope.getCompleteUsers = function(){
		$resource("http\://localhost\:3000/user/complete", {}, { get : { method:'GET' , isArray:false} }).get().$promise.then(function(res){
			$scope.completeUsers = res.data;  
		});
	}

	UserFactory.get({}).$promise.then(function(res){
		$scope.users = res; 

		// add fields to the users indicating the number of matches and views
		$scope.users.forEach( function(u) {
			$scope.populateLikesAndMatches(u);
			$scope.populateAverageMessages(u);
		})

		$scope.getCompleteUsers();  

	})


})