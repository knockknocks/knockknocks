'use strict';

angular.module('kkApp', [])
	.controller('KnockCtrl', function ($scope, $http, $location) {
		$scope.showLogin = true;
		$scope.showStart = null;
		$scope.showNew = null;
		$scope.showHear = null;
		$scope.User = {};
		$scope.Token = {};
		$scope.JokeToken = {};
		$scope.errorMessage = '';

		//////// login
		$scope.register = function() {
			if ($scope.User.email) {
				$http.post('/signup', $scope.User).
					success(function(data) {
						$scope.errorMessage = 'Signup successful! Log in for knockknocks.'
						$scope.User.email = '';
					}).error(function(err) {
						$scope.errorMessage = err.msg;
					});
			} else {
				var Auth = { headers: { Authorization: 'Basic ' + 
										btoa($scope.User.username + ':' + $scope.User.password),
									Accept: 'application/json;odata=verbose'
					}
				};
				$http.get('/login', Auth).
					success(function(data) {
						$scope.Token = data;
						$scope.errorMessage = '';
			    	$scope.showLogin = !($scope.showStart = true);
					}).error(function(err) {
						$scope.errorMessage = err.msg;
					});
			}

			//////// start
	    $scope.newJoke = function() {
	    	$scope.showStart = !($scope.showNew = true);
	    	$scope.showSetup = $scope.showPunch = $scope.showNextSteps = false;
	    };
			$scope.hearJoke = function() {
				$scope.showStart = !($scope.showHear = true);
	    	$scope.showHearSetup = $scope.showNextSteps = false;
			};
			$scope.logoff = function() {
				$scope.Token = {};
				$scope.showStart = !($scope.showLogin = true);
			};

			//////// newjoke
			$scope.getNewjoke = function() {
			};
			$scope.postNewSetup = function(setup) {

			};
			$scope.postNewPunchline = function(punchline) {

			};

			//////// hearjoke
			$scope.getKnockknock = function() {
				$http.get('/knockknock').
					success(function(jokeStart) {
						$scope.JokeToken = jokeStart.token;
					}).error(function(err) {
						$scope.errorMessage = err.msg;
					});
			};

			$scope.getSetup = function() {
				$http.get('/whosthere/' + $scope.JokeToken).
					success(function(jokeSetup) {
						$scope.Joke.setup = jokeSetup.msg;
						$scope.JokeToken = jokeSetup.token;
					}).error(function(err) {
						$scope.errorMessage = err.msg;
					});
			};
			$scope.getPunchline = function() {
				$http.get('/punchline/' + $scope.JokeToken).
					success(function(jokePunchline) {
						$scope.Joke.punchline = jokePunchline.msg;
						$scope.JokeToken = jokeSetup.token;
					}).error(function(err) {
						$scope.errorMessage = err.msg;
					});
			};
			$scope.rateJoke = function(rating) {

			};
		}
	});
