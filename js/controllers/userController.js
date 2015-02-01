angular.module('analyticsApp').controller('UserController', function($scope, $resource, $filter,  UserFactory, LikeFactory, MessageFactory){

$scope.specifiedUser = '53b1fb9c2593bbb8348f0b89';

$scope.userData = {
		swipes : '-1',
		matches : '-1',
		likes : '-1',
		conversations : '-1', 
		messagesSent : '-1',
		messagesRecieved : '-1',
		lastLike : '-1',
		lastMatch : '-1',
		lastMessage : Date.now,
		messageDates : [],
		likeDates : {}
	}

$scope.user = { created : -1 }; 

//stuff for graphing

$scope.chartType = 'bar';
$scope.messagesSeries = ['Sent','Recieved'];
$scope.swipesSeries = ['Likes','Matches']
$scope.messagesChartData = [];
$scope.swipesChartData = [];

$scope.chartConfig = {
  title: '',
  tooltips: true,
  labels: false,
  mouseover: function() {},
  mouseout: function() {},
  click: function() {},
  legend: {
    display: true,
    //could be 'left, right'
    position: 'left'
  },
  innerRadius: 0, // applicable on pieCharts, can be a percentage like '50%'
  lineLegend: 'lineEnd' // can be also 'traditional'
}

$scope.swipesChart = {
	series:$scope.swipesSeries,
	data:$scope.swipesChartData
}

$scope.messagesChart = {
	series:$scope.messagesSeries,
	data:$scope.messagesChartData
}



//takes an array of dates and turns them into 4 digit numbers (DDHH) to be graphed
// $scope.parseDateData = function(dates){ //TODO: terrible name. 
// 		//how many messages
	 
// 	MessageFactory.get({id:$scope.user._id}).$promise.then( function( res ){
// 		var lastIdx = 0; 
// 		var messageDirection = 0; 
// 		var newDay = '-1';  //initialize to be the first day
// 		res.data.forEach( function( message ){
// 			if( message.sender === $scope.user._id ){ //count for the right number
// 				messageDirection = 0; 
// 			}else{ messageDirection = 1;}

// 			if( $filter('date')(message.created,'dd') === newDay ){ //if we've seen this 'x' before
// 				$scope.messageChartData[ lastIdx - 1 ].y[0]++; 
// 			}
// 			else{ 
// 				newDay = $filter('date')(message.created,'dd');
// 				lastIdx = $scope.messageChartData.push( { 'x':newDay , 'y':[1] , 'tooltip':'thisisatooltip'} ); 
// 			}
// 		})
// 	})

// 	return;
// }

$scope.getSwipesAndMatchesData = function(){
	$scope.userData.swipes = 0;
	$scope.userData.likes = 0; 
	$scope.userData.matches = 0; 

	var viewedUsers = $scope.user.viewedUsers; 
	var newDay = -1; 
	var dateFormat = 'M/dd';
	var lastIdx = 0; 

	$scope.userData.swipes = viewedUsers.length;  //everyone we've seen is a swipe

	//how many swipes were likes? loop over each 'like' and determine whether a match was made
	viewedUsers.forEach( function(swipe){
			LikeFactory.get({source:$scope.user._id, target:swipe}).$promise.then( function(call){
				if( call.length > 0 ){ //user liked other
					$scope.userData.likes++;
					$scope.userData.lastLike = call[0].created; 

					//increment the current day's 'likes' counter, or add the next day as a data point
					if( newDay === $filter('date')(call[0].created,dateFormat) ){
							$scope.swipesChartData[ lastIdx - 1 ].y[0]++; 
					}
					else{ // new x, intialize y
						newDay = $filter('date')(call[0].created,dateFormat);
						lastIdx = $scope.swipesChartData.push({'x':newDay, 
													 'y':[1,0],
													 'tooltip':'BLAHTOOLTOP' })
						// console.log($scope.swipesChartData[lastIdx - 1])
					}

					//check if the other liked the user
					LikeFactory.get({source:swipe , target:$scope.user._id}).$promise.then(function( response ){
						if( response.length > 0 ){ //other liked user as well
							$scope.userData.matches++; 
							$scope.swipesChartData[lastIdx - 1].y[1]++;  //increment matches for the day
							$scope.userData.lastMatch = response[0].created; 
							//if the last match was 
						}
					})
				}
			})
	})
	
}


/*
	This function is too big and bulky, split it up
*/
$scope.getMessagesData = function(){
	$scope.conversations = 0; 
	$scope.messagesSent = 0;
	$scope.userData.messageRecieved = 0;


	//for date binning
	var lastIdx = 0; 
	var messageDirection = 0; 
	var newDay = '-1';  //initialize to be the first day
	var dateFormat = 'M/dd';


	//how many messages
	MessageFactory.get({id:$scope.user._id}).$promise.then( function( res ){
		res.data.forEach( function( message ){
			if( message.sender === $scope.user._id ){ //a message sent by the user
				$scope.userData.messagesSent++;
				messageDirection = 0;
			}
			else{ 
				$scope.userData.messagesRecieved++;
				messageDirection = 1;
			} 

			//bin the dates for graphing, by mesageDirection format
			if( $filter('date')(message.created,dateFormat) === newDay ){ //Another instance of a previously encountered 'x', increment our y val
				$scope.messagesChartData[ lastIdx - 1 ].y[messageDirection]++; 
			}
			else{ //a new 'x' , initialize y
				newDay = $filter('date')(message.created,dateFormat);
				lastIdx = $scope.messagesChartData.push( { 'x':newDay , 'y':[0,0] , 'tooltip':'Blah'} );
				$scope.messagesChartData[ lastIdx - 1 ].y[messageDirection]++;  //TODO ugly
			}

		})

	//the most recent message is the last one in the message array (its sorted)
		$scope.userData.lastMessage = res.data[res.data.length-1].created; 

	})

	UserFactory.getConversation({userId:$scope.user._id}).$promise.then( function(res){
		$scope.userData.conversations = res.data.length;
	})
}

$scope.getUser = function( userId ){
	//intially put the first user in the database into the 
	UserFactory.getUser({userId:userId}).$promise.then( function(user){
		$scope.user = user;

		//once the user is retrieved, populate userData
		$scope.getSwipesAndMatchesData();
		$scope.getMessagesData(); 

		// console.log($scope.swipesChartData)
	})
}

//initialize with some data
$scope.getUser( $scope.specifiedUser ); 


})
