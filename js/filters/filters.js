angular.module('locationFilter', [] ).filter('location', function(){
	return function(input){
		if( !input ){
			return 'unspecified'
		}

		//Make a string all lower case
		input = input.toLowerCase();
		//remove all white space
		input = input.replace(/ /g,'')

		//strip useless keywords
		input = input.replace(/city/g,'')
		input = input.replace(/area/g,'')
		input = input.replace(/greater/g,'')

		var caliNames = ['california','san','los']
		var nyNames = ['ny','nyc','newyork','manhatten','brooklyn','bronx']
		var internationalNames = ['UK','unitedkingdom','poland','germany','china','brazil','canada','thailand','india','japan','africa','australia','belgium']

		for( var entry in caliNames ){ //does it contain a cali-name?
			if( input.indexOf(caliNames[entry]) > -1 ){
				return 'california'
			}
		}

		for( var entry in nyNames){ //does it contain a ny name?
			if( input.indexOf(nyNames[entry]) > -1 ){
				return 'new york'
			}
		}

		for( var entry in internationalNames ){
			if( input.indexOf(internationalNames[entry]) > -1){
				return 'international'
			}
		}

		return input
	}
})


angular.module('aboutFilter', [] ).filter('about', function(){
	return function(input){
		if(!input){
			return 'unspecified'
		}

		input = input.toLowerCase(); 
		input = input.replace(/ /g,''); 

		var hr = ['hiringmanager','humanresources','talentaquisition','headhunter','staffing','recruit']
		var tech = ['develop','engineer','code','coding','computer','cs']
		var designer = ['design','ui/ux','illustrat']
		var business = ['finance','business','accounting','marketing','operations']
		var legal = ['law','legal','attorney']
		var writers = ['journal','blog','english','lit','write']
		var student = ['student']

		var categories = {'hr':hr,'tech':tech,'designer':designer,'legal':legal,'writers':writers,'student':student}

		for( var category in categories ){
			for( var entry in category ){
				if( input.indexOf( categories[category][entry]  ) > -1  ){ //found a matching string
					console.log( categories[category][entry] )
					return category;  //only care about the broad category people are in
				}
			}
		}
		return 'none'
	}
})