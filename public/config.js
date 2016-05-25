myApp.config(['$routeProvider', '$locationProvider', function AppConfig($routeProvider, $locationProvider) {

    $routeProvider
        .when('/auth/linkedin/callback', {
            templateUrl: 'templates/home.html'
        })
        .otherwise({
            redirectTo: '/home'
        }
    );

    // enable html5Mode for pushstate ('#'-less URLs)
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

}]);

