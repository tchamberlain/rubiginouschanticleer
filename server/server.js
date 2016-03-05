var express = require( 'express' );
var db = require( './config/db' );
var app = express();

var http = require( 'http' ).Server( app );
var io = require( 'socket.io' )( http );
var Session = require( './sessions/sessions' );
var User = require( './users/users' );

io.on( 'connect' , function( socket ){
  console.log( 'we are connected!!' );
  socket.on( 'disconnect', function() {
    console.log( 'were not connected anymore' );
  });

  //this recieves the create event emitted in client/sessions/sessions.js-emitCreate
  socket.on( 'session', function( data ) {
    Session.findOne( { where: { sessionName: data.sessionName } } )
    .then( function( session ) {
      //this function emits an event named newSession and sends the newly created session
      io.emit( 'newSession', session.dataValues );
    });
  });

  //this function listens to the new join event in client/sessions/sessions.js-emitJoin
  socket.on( 'newJoin', function( data ) {
    //this function creates a new or joins an existing socket-room
    socket.join( data.sessionName );
    User.findOne( { where: { username: data.username } } )
    .then( function( user ) {
      //this function emits a newUser event and the new user to a specific room named the session name
      io.to( data.sessionName ).emit( 'newUser', user );
    });
  });

  socket.on( 'startSession', function( data ) {
    socket.join( data.sessionName );
    io.to( data.sessionName ).emit( 'sessionStarted' );
  });

  // This listener handles broadcasting a vote to connected clients.
  socket.on( 'vote', function( voteData ) {
    socket.join( voteData.sessionName );
    io.to( voteData.sessionName ).emit( 'voteAdded', voteData );
  });

  // This listener handles broadcasting a secondPassed to connected clients.
  socket.on( 'secondPassed', function( data ) {
    socket.join( data.sessionName );
    console.log('sec passed');
    io.to( data.sessionName ).emit( 'secondPassed', data );
  });

  // This listener handles broadcasting a win to connected clients.
  socket.on( 'win', function( data ) {
    socket.join( data.sessionName );
    console.log('win!');
    io.to( data.sessionName ).emit( 'win', data );
  });

  // This listener handles broadcasting a tie to connected clients.
  socket.on( 'tie', function( data ) {
    socket.join( data.sessionName );
    console.log('tie!');
    io.to( data.sessionName ).emit( 'tie', data );
  });

});
const PORT = 8000;

require( './config/middleware' )( app, express );
require( './config/routes' )( app, express );

http.listen( process.env.PORT || PORT );
console.log( 'Listening on port ' + PORT );

module.exports = app;
