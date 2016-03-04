var Genre = require( './genres' );
var request = require('request');

request('http://api.themoviedb.org/3/genre/movie/list?api_key=0705a8dd07324da673f8ab11366b85b6', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var genres = JSON.parse(body).genres;
    var counter = 0;
    genres.forEach(function(genre) {
    	Genre.create({
    		id: genre.id,
    		title: genre.name
    	})
    	.catch(function(err) {
    	});
    });
  } else {
    console.error(error);
  }
});

module.exports = {

  getAllGenres: function(req, res) {
  	Genre.findAll()
	  	.then(function(genres) {
        res.send(genres);
	  	});
  },

  getGenre: function(req, res) {
  	var genre = req.params.genre;
  	Genre.findOne({where: {title: genre}})
  		.then(function(genre) {
  			res.json(genre);
  		});
  },

  getMoviesByGenre: function (req, res) {
    var genreId = req.params.genreId;
    var url = 'http://api.themoviedb.org/3/discover/movie?api_key=0705a8dd07324da673f8ab11366b85b6&with_genres=' + genreId + '&sort_by=popularity.desc';

    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var movies = JSON.parse(body).results;
        res.send(movies);
      } else {
        console.error(error);
      }
    });
  }

};
