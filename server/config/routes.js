// require controllers here
var usersController = require('../users/usersController.js');
var genresController = require('../genres/genresController.js');
var moviesController = require('../movies/moviesController.js');
var sessionsController = require('../sessions/sessionsController.js');
var sessions_usersController = require('../sessions_users/sessions_usersController.js');

var helpers = require('./helpers.js'); // our custom middleware


module.exports = function ( app, express ) {
  /* USERS */
  app.get('/api/users', usersController.getAllUsers );
  app.get('/api/users/:user', usersController.validate );
  app.post('/api/users/signin', usersController.signin );
  app.post('/api/users/signup', usersController.signup );
  app.post('/api/users/signout', usersController.signout );

  /* GENRES */
  app.get('/api/genres', genresController.getAllGenres );
  app.get('/api/genre/:genre', genresController.getGenre );

  /* MOVIES */
  app.get('/api/movies', moviesController.getAllMovies );
  app.get('/api/movies/package/:number', moviesController.getMoviePackage );
  app.get('/api/movies/:movie_id', moviesController.getMovie );

  /* SESSIONS */
  app.get('/api/sessions', sessionsController.getAllSessions );
  app.post('/api/sessions', sessionsController.addSession );

  /* SESSIONS_USERS */
  app.get('/api/sessions/users/:sessionName', sessions_usersController.getUsersInOneSession );
  app.get('/api/sessions/:sessionName', sessionsController.getSessionByName );
  app.get('/api/sessions/:session_id/:user_id', sessions_usersController.getSessionUserBySessionAndUser );
  app.post('/api/sessions/users', sessions_usersController.addOneUser );


  // If a request is sent somewhere other than the routes above,
  // send it through our custom error handler
  app.use( helpers.errorLogger );
  app.use( helpers.errorHandler );

};
