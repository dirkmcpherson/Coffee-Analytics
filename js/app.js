var app = angular.module('analyticsApp',['ngResource','angularCharts','locationFilter','aboutFilter'])
var port = 1337; 

app.config(['$httpProvider' , function($httpProvider){
	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
} ] );


app.run( function($rootScope, $resource, $filter){

	$rootScope.UsageData = function(){
		//format data for graph display
		var data = []

		//get the usage data
		$resource("http\://localhost\:3000/usage", {}, { get : { method:'GET' , isArray:false} }).get().$promise.then(function(res){

		// console.log(res)

			for( var key in res.data){
				data.push({'x':key , 'y':[res.data[key]]})
			}

			data.sort( function(a,b){ return (a.x - b.x) } ); //sort from earliest date to latest (will stop working in January)
			// console.log( data )
		});
		return data; 
	}

	$rootScope.MessagesUsageData = function(){
		//format data for graph display
		var data = []

		//get the usage data
		$resource("http\://localhost\:3000/message/usage", {}, { get : { method:'GET' , isArray:false} }).get().$promise.then(function(res){
			for( var key in res.data ){
				if( key === '0'){
					//do nothing
				}
				else if( key === '100'){
					data.push({'x':'100+','y':[res.data[key]]})
				}
				else{
					data.push({'x':key,'y':[res.data[key]]})
				}
			}
		})
		return data
	}

	$rootScope.LikesUsageData = function(){
		//format data for graph display
		var data = []

		//get the usage data
		$resource("http\://localhost\:3000/like/usage", {}, { get : { method:'GET' , isArray:false} }).get().$promise.then(function(res){
			for( var key in res.data ){
				if( key === '0'){
					//do nothing
				}
				else{
					data.push({'x':key,'y':[res.data[key]]})
				}
			}
		})
		return data
	}

	$rootScope.LikesData = function(){
	//format data for graph display
		var data = []

		//get the usage data
		$resource("http\://localhost\:3000/like/usageDate", {}, { get : { method:'GET' , isArray:false} }).get().$promise.then(function(res){
			for( var key in res.data ){
				data.push({'x':key,'y':[res.data[key]]})
			}
		})
		return data
	}

	$rootScope.MessagesData = function(){
	//format data for graph display
		var data = []

		//get the usage data
		$resource("http\://localhost\:3000/message/usageDate", {}, { get : { method:'GET' , isArray:false} }).get().$promise.then(function(res){
			for( var key in res.data ){
				data.push({'x':key,'y':[res.data[key]]})
			}
		})
		return data
	}

	$rootScope.MatchesData = function(){
		var data = []; 
		var total = 0; 

		$resource("http\://localhost\:3000/matches", {}, { get : { method:'GET' , isArray:false} }).get().$promise.then(function(res){

		for( var key in res.data ){
			total += res.data[key]; 
			data.push({'x':key , 'y':[res.data[key]]});
		}

		});

		return {data:data, total:total}; 
	}

	$rootScope.TotalUserData = function(){
		//format the data for graph display
		var data = []; 
		var total = 0; 

		//get the new user data
		$resource("http\://localhost\:3000/user/created", {}, { get : { method:'GET' , isArray:false} }).get().$promise.then(function(res){

		for( var key in res.data ){
			total += res.data[key]; 
			data.push({'x':key , 'y':[total]});
		}

		});
		return data; 
	}

	$rootScope.NewUserData = function(){
		//format the data for graph display
		var data = []; 
		var total = 0; 

		//get the new user data
		$resource("http\://localhost\:3000/user/created", {}, { get : { method:'GET' , isArray:false} }).get().$promise.then(function(res){

		for( var key in res.data ){
			total += res.data[key]; 
			data.push({'x':key , 'y':[res.data[key]]});
		}

		// console.log(data); 
		});
		return data; 
	}

	$rootScope.UserCategoryData = function(){
		var data = []; 
		var categories = {}; 

		$resource("http\://localhost\:3000/user/about", {}, { get : { method:'GET' , isArray:false} }).get().$promise.then(function(res){

			for( var key in res.data ){
				var cat = $filter('about')(res.data[key]); 
				if( categories.hasOwnProperty(cat) ){
					categories[cat]++; 
				}
				else{
					categories[cat] = 1; 
				}
			}

			//now go through again and format data
			for( var key in categories ){
				if( key == 'none'){
					//do nothing 
				}
				else{
					data.push({'x':key,'y':[categories[key]]})
				}
			}

		});
		return data; 
	}

	$rootScope.LocationData = function(){
		var temp = {}; 
		var data = []; 
		var totalPopulation = 0;
		var misc = 0;  

		//get the user location data
		$resource("http\://localhost\:3000/user/location", {}, { get : { method:'GET' , isArray:false} }).get().$promise.then(function(res){

			//bin the data, gotta go through twice to apply the filter (otherwise set it up on server, dont want to do that yet)
			for( var key in res.data ){
				var location = $filter('location')(key); 
				var count = res.data[key]; 

				if( temp.hasOwnProperty(location) ){
					temp[location] += count; 
				}
				else{
					temp[location] = count;  //initialize location
				}

			}

			//now go through again and format data
			for( var key in temp ){
				//Put all small populatiosn in their own category
				if( temp[key] > 14 ){
					data.push({'x':key , 'y':[temp[key]]}); 
				}
				else{
					misc += temp[key]; 
				}

				totalPopulation += temp[key];
			}	

			data.push({'x':'misc', 'y':[misc]})

			//Finally, format as %
			for( var idx in data){
				data[idx].y[0] = $filter('number')(100*data[idx].y[0]/totalPopulation,1) //to one decimal place
			}

		})
		return data; 
	}


})