myApp.controller('linkedinController', ['$scope','$http','$sce','$routeParams',function($scope, $http,$sce,$routeParams) {
    

	$scope.init = function(){
			
		//initialize values
		$scope.public_url='';
		$scope.search_view=true;
		$scope.add_profile_loader=false;
		$scope.search_name_loader=false;
		$scope.search_skill_loader=false;
		$scope.person ={
			name : '',
			skill : ''
		}
		
	};

	//fetch profile from linkedin (according to public profile url) and store it in db
	$scope.add_profile = function(){
		$scope.add_profile_loader=true;
		$http.get('/linkedin_public_profile?url='+$scope.public_url)
			.success(function(response){
				$scope.add_profile_loader=false;
				if(!!response && response.url != ''){
					$scope.add_profile_loader=false;	
					calculate_profile_scoring(response);
					$scope.profiles = [];
					$scope.profiles.push(response);
					$scope.search_view=false;
				}
				//url is not valid
				else{
					swal({   title: "Must insert a valid url",   text: "Please try again",   timer: 2000,   showConfirmButton: false });
				}
			})
			.error(function(data, status, headers, config) {
			  alert("Profile url does not exist");
			  $scope.add_profile_loader=false;

			});			
	};	
	
	//calculate profile scoring - total 100 points 
	/*
		For each year of current experience the profile received 15 points.
		For each year of past experience the profile received 10 points.
		For each skill the profile received 5 points - max 50 points.
	*/
	function calculate_profile_scoring(profile){
		
		var current_experience_scoring=0;
		var past_experience_scoring=0;
		//skills scoring
		var skills_scoring= profile.skills.length > 10 ? 50 : profile.skills.length * 5;
		
		//current experience scoring
		for(var i=0;i<profile.experience.current.length;i++){
			var index = (profile.experience.current[i].date).search('year');
			if(index != -1){
				var num_of_years =(profile.experience.current[i].date).charAt(index-2);
				current_experience_scoring = current_experience_scoring + (15 * num_of_years);
			}
			

		}
		
		//past experience scoring
		for(var i=0;i<profile.experience.past.length;i++){
			var index = (profile.experience.past[i].date).search('year');
			if(index != -1){
				var num_of_years =(profile.experience.past[i].date).charAt(index-2);
				past_experience_scoring = past_experience_scoring + (10 * num_of_years);
			}
		}
		
		var total_score =current_experience_scoring + past_experience_scoring + skills_scoring > 100 ? 100 : current_experience_scoring + past_experience_scoring + skills_scoring;
		profile.profile_scoring = total_score;
		add_profile_toDb(profile);
		
	}
	
	//add profile to mongoDB
	function add_profile_toDb(profile){
		
		$http.post("/add_profile_toDb",profile)
		.success(function(data, status, headers, config) {
		  if(data.success) {
			console.log('add_profile_toDb');
			
		  }else{
			alert("הפעולה נכשלה, נסה שנית מאוחר יותר.");

		  }
		})
		.error(function(data, status, headers, config) {
		  alert("הפעולה נכשלה, נסה שנית מאוחר יותר.");

		});
	}
	
	//search section by name
	$scope.search_name = function(){
		$scope.search_name_loader=true;
		if($scope.person.name!='' ){
			
			$http.get("/get_profile_user_by_name?name="+$scope.person.name)
				.success(function(data){
					if(data.success) {
						$scope.search_name_loader=false;
						if(data.profile.length !=0){
							$scope.profiles = data.profile;
							$scope.search_view=false;	
						}
						else{
							swal({   title: "Must insert a valid name",   text: "Please try again",   timer: 2000,   showConfirmButton: false });
						}
					  }					 
				})
				.error(function(data, status, headers, config) {
					alert("הפעולה נכשלה, נסה שנית מאוחר יותר."); 
					$scope.search_name_loader=false;
				});
		}
		else{
			console.log('none');
			$scope.search_name_loader=false;		
		}	
		
		
	};
	
	//search section bt skill
	$scope.search_skill = function(){
		$scope.search_skill_loader=true;
		if($scope.person.skill!='' ){
			
			$http.get("/get_users_by_skill?skill="+$scope.person.skill)
				.success(function(data){
					if(data.success) {	
						$scope.search_skill_loader=false;					
						if(data.profile.length !=0){
							$scope.profiles = data.profile;
							$scope.search_view=false;	
						}
						else{
							swal({   title: "Must insert a valid skill",   text: "Please try again",   timer: 2000,   showConfirmButton: false });
						}						
					  }					 
				})
				.error(function(data, status, headers, config) {
					alert("הפעולה נכשלה, נסה שנית מאוחר יותר."); 
					$scope.search_skill_loader=false;
				});
		}
		else{
			console.log('none');
			$scope.search_skill_loader=false;
		}	
		
		
	};
	
	
	
	//get an html code and make it recognizable by angular 
	$scope.renderHtml = function(html_code)
	{
		return $sce.trustAsHtml(html_code);
	};

}]);