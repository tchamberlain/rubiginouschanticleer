angular.module( 'moviematch.genres', [] )

.controller('GenresController', function($scope, FetchGenres) {
	
	var getAllGenres = function () {
		FetchGenres.getAllGenres()
			.then(function(genres) {
				$scope.genres = genres;
			})
			.catch(function(err) {
				console.error('EERRRRRRROOOORRRR', err);
			});
	};

	getAllGenres();

	var getGenre = function (genre) {
		FetchGenres.getGenre(genre)
			.then(function(genre) {
				$scope.specificGenre = genre.genreName;
			});
	}

	getGenre('Action');

});