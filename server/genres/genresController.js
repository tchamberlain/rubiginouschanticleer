var Genre = require( './genres' );
var request = require('request');

request('http://api.themoviedb.org/3/genre/movie/list?api_key=0705a8dd07324da673f8ab11366b85b6', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var genres = JSON.parse(body).genres;
    var counter = 0;
    genres.forEach(function(genre) {
    	Genre.create({
    		genreId: genre.id,
    		genreName: genre.name
    	})
    	.catch(function(err) {
    	});
    });
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
  	genre = req.params.genre;
  	Genre.findOne({where: {genreName: genre}})
  		.then(function(genre) {
  			res.json(genre);
  		});
  }

};
