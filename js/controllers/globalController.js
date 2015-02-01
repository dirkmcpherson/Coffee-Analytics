angular.module('analyticsApp').controller('GlobalController', function($scope, $resource, $filter, $q){

	$scope.users = 0;
	$scope.completedProfiles = 0; 
	$scope.averageMessages = 0; 
	$scope.totalSwipes = 0;
	$scope.totalLikes = 0; 
	$scope.totalMatches = 'Click Matches Tab (Takes Forever to Load)'; 

	//chart stuff
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
  	lineLegend: 'traditional' // can be also 'traditional'
	}

	$scope.chartType = 'line';

	$scope.activeChartData = [];
	$scope.activeChartSeries = [];
	$scope.activeChartConfig = $scope.chartConfig; 
	$scope.activeChartTitle = 'No Data)'
	$scope.activeChart = {
		series:$scope.activeChartSeries,
		data: $scope.activeChartData	
	}

	$scope.getMacroData = function(){
		$resource("http\://localhost\:3000/macro", {}, { get : { method:'GET' , isArray:false} }).get().$promise.then(function(res){
			$scope.totalSwipes = res.swipes;
			$scope.totalLikes = res.likes;
			$scope.totalMatches = res.matches;   
		});
	}

	$scope.getNumUsers = function(){
		$resource("http\://localhost\:3000/user/count", {}, { get : { method:'GET' , isArray:false} }).get().$promise.then(function(res){
			$scope.users = res.count;  
		});
	}

	$scope.getCompleteUsers = function(){
		$resource("http\://localhost\:3000/user/complete", {}, { get : { method:'GET' , isArray:false} }).get().$promise.then(function(res){
			$scope.completedProfiles = res.data;  
		});
	}

	$scope.get

	$scope.graphUsage = function(){
		console.log('graphUsage')

		$scope.activeChartData = $scope.UsageData()

		$scope.activeChartSeries = ['Unique User Activity'];
		$scope.activeChartConfig = $scope.chartConfig; 
		$scope.activeChartConfig.title = 'Unique User Usage (per day)'
		$scope.activeChartConfig.labels = false;
		$scope.activeChart = {
			series:$scope.activeChartSeries,
			data: $scope.activeChartData	
		}

		$scope.chartType = 'bar'
	}

	$scope.graphLikesUsage = function(){
		console.log('graphLikesUsage')

		$scope.activeChartData = $scope.LikesUsageData();
		$scope.activeChartSeries = ['Likes']
		$scope.activeChartConfig.title = "Likes (Binned Data)"
		$scope.activeChartConfig.labels = true;
		$scope.activeChart = {
			series:$scope.activeChartSeries,
			data:$scope.activeChartData
		}

		$scope.chartType = 'pie'
	}

	$scope.graphMessagesUsage = function(){
		console.log('graphMessagesUsage')

		$scope.activeChartData = $scope.MessagesUsageData();
		$scope.activeChartSeries = ['Messages Sent']
		$scope.activeChartConfig.title = "Messages Sent (Binned Data)"
		$scope.activeChartConfig.labels = true;
		$scope.activeChart = {
			series:$scope.activeChartSeries,
			data:$scope.activeChartData
		}

		$scope.chartType = 'pie'
	}

	$scope.graphMessages = function(){
		console.log('graphMessages')

		$scope.activeChartData = $scope.MessagesData(); //call the route
		$scope.activeChartSeries = ['Messages']
		$scope.activeChartConfig = $scope.chartConfig;
		$scope.activeChartConfig.title = "Messages Per Day"
		$scope.activeChartConfig.labels = false;
		$scope.activeChart = {
			series:$scope.activeChartSeries,
			data: $scope.activeChartData
		}

		$scope.chartType = 'line'
	}

	$scope.graphLikes = function(){
		console.log('graphLikes')

		$scope.activeChartData = $scope.LikesData(); //call the route
		$scope.activeChartSeries = ['Likes']
		$scope.activeChartConfig = $scope.chartConfig;
		$scope.activeChartConfig.title = "Likes Per Day"
		$scope.activeChartConfig.labels = false;
		$scope.activeChart = {
			series:$scope.activeChartSeries,
			data: $scope.activeChartData
		}

		$scope.chartType = 'line'
	}

	$scope.graphTotalUsers = function(){
		console.log('graphTotalUsers')

		$scope.activeChartData = $scope.TotalUserData(); //call the route
		$scope.activeChartSeries = ['Total Users']
		$scope.activeChartConfig = $scope.chartConfig;
		$scope.activeChartConfig.title = "Total Users Over Time"
		$scope.activeChartConfig.labels = true;
		$scope.activeChart = {
			series:$scope.activeChartSeries,
			data: $scope.activeChartData
		}

		$scope.chartType = 'line'		
	}

	$scope.graphNewUsers = function(){
		console.log('graphNewUsers')

		$scope.activeChartData = $scope.NewUserData(); //call the route
		$scope.activeChartSeries = ['New Users']
		$scope.activeChartConfig = $scope.chartConfig;
		$scope.activeChartConfig.title = "New Users Per Day"
		$scope.activeChartConfig.labels = false;
		$scope.activeChart = {
			series:$scope.activeChartSeries,
			data: $scope.activeChartData
		}

		$scope.chartType = 'bar'
	}

	$scope.graphLocation = function(){
		console.log('graphLocation')

		$scope.activeChartData = $scope.LocationData();
		$scope.activeChartSeries = ['Location (%)']
		$scope.activeChartConfig.title = "User Location % (approx - populations of less than 15 ignored)"
		$scope.activeChartConfig.labels = true;
		$scope.activeChart = {
			series:$scope.activeChartSeries,
			data:$scope.activeChartData
		}

		$scope.chartType = 'pie'
	}

	$scope.graphCategory = function(){
		console.log('graphCategory')

		$scope.activeChartData = $scope.UserCategoryData(); //call the route
		$scope.activeChartSeries = ['Categories']
		$scope.activeChartConfig = $scope.chartConfig;
		$scope.activeChartConfig.title = "Identified Category (Rough Estimate - listed if keyword is included in about)"
		$scope.activeChartConfig.labels = true;
		$scope.activeChart = {
			series:$scope.activeChartSeries,
			data: $scope.activeChartData
		}

		$scope.chartType = 'pie'
	}

	$scope.graphMatches = function(){
		console.log('graphMatches')

		var data = $scope.MatchesData(); 

		$scope.activeChartData = data.data; //call the route
		$scope.activeChartSeries = ['Matches']
		$scope.activeChartConfig = $scope.chartConfig;
		$scope.activeChartConfig.title = "Matches Per Day (Underestimate - deleting conversations deletes matches)"
		$scope.activeChartConfig.labels = false;
		$scope.activeChart = {
			series:$scope.activeChartSeries,
			data: $scope.activeChartData
		}

		$scope.chartType = 'bar'

		// $scope.totalMatches = data.total; 
	}

	$scope.globalSetup = function(){
		$scope.getNumUsers();
		$scope.getCompleteUsers();
		$scope.graphUsage(); 
		$scope.getMacroData(); 
	}

	$scope.globalSetup(); 
	

})


