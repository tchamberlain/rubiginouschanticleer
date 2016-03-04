angular.module( 'moviematch.lobby', [] )

.controller( 'LobbyController', function( $scope, Session, Lobby, Socket, $location, Auth, FetchGenres ) {
  $scope.session = {};

  Session.getSession()
  .then( function( session ) {

    $scope.session = session;
    
    Lobby.getUsersInOneSession( $scope.session.sessionName )
    .then( function( users ){
      $scope.users = users;
    } );

  });

  $scope.username = Auth.getUserName();
  $scope.users = [];


  //this function is listening to any newUser event and recieves/appends the new user
  Socket.on( 'newUser', function( data ) {
    $scope.users.push( data );
  } );

  $scope.startSession = function( sessionName ) {
    Socket.emit( 'startSession', { sessionName: sessionName } );
  };

  Socket.on( 'sessionStarted', function() {
    //change the path after we've gotten the genre data
    FetchGenres.getAllGenres()
    .then(function(){
      $location.path( '/selectingOption/genre' );
    });
  });

} )
