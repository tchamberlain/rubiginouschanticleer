angular.module( 'moviematch.services', [] )

.factory( 'Auth', function( $http, $location, $window ) {
  var username = '';
  return {
    signin : function( user ) {
      return $http.post( '/api/users/signin', user )
      .then(function ( resp ) {
        return resp.data.token;
      });
    },

    signup : function( user ) {
      return $http.post( '/api/users/signup', user )
      .then(function( resp ) {
        return resp.data.token;
      })
      .catch(function( err ) {
        console.log(err);
      });
    },

    isAuth : function() {
      return !!$window.localStorage.getItem( 'com.moviematch' );
    },

    signout : function() {
      $window.localStorage.removeItem( 'com.moviematch' );
    }, 

    setUserName : function( user ) {
      $window.localStorage.setItem( 'username', user.username );
    },

    getUserName : function () {
      return $window.localStorage.getItem( 'username' );
    }
  } 
})

.factory( 'Session', function( $http, $window, $location ) {
  var selectedOption;
  return {
    getSelectedOption: function(){
      return selectedOption;
    },

    setSelectedOption: function(option){
      selectedOption = option;
    },

    createSession: function( sessionName, sessionCreator, callback ) {
      return $http.post( '/api/sessions', { sessionName: sessionName, 
        sessionCreator: sessionCreator

       } )
      .then( function( response ) {
        callback( sessionName ); // used for emitting session data
        return response;
      }, function( err ) {
        console.error( err );
      } );
    },

    fetchSessions: function() {
      return $http.get ( '/api/sessions' )
      .then( function( response ) {
        return response.data;
      }, function( err ) {
        console.error( err );
      } ); 
    }, 

    joinSession: function( sessionName, username, callback ) {
      return $http.post( '/api/sessions/users', { sessionName: sessionName, username: username } )
      .then( function( response ) {
        callback( username, sessionName ); // used for emitting session data
        $location.path( '/lobby' );
        return response;
      }, function( err ) {
        console.error( err );
      } );
    },

    setSession: function( sessionName ) {
      $window.localStorage.setItem( 'sessionName', sessionName );
    }, 

    getSession: function() {
      var sessionName = $window.localStorage.getItem( 'sessionName' );
      return $http.get( '/api/sessions/' + sessionName )
      .then( function( session ) {
        return session.data;
      }, function( err ) {
        console.error( err );
      });
    }

  }
})

.factory( 'Socket', ['socketFactory', function(socketFactory){
  return socketFactory();
}])

.factory( 'Votes', function( $http, $location, Socket ) {
  var prevNumberOptions = null; 
  var hashFn = function(str, max) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var letter = str[i];
      hash = (hash << 5) + letter.charCodeAt(0);
      hash = (hash & hash) % max;
    }
    return hash;
  };

  return {
    resetPrevNumberOptions: function(){
      prevNumberOptions = null;
    },

    addVote: function(voteData){
      Socket.emit( 'vote', voteData );
    },

    receiveVote: function(id, options, addVote){
      for(var i = 0; i < options.length; i ++){
        if(options[i].id === id){
          if(addVote){
            options[i].votes += 1;            
          } else {
            options[i].votes -= 1;     
          }
        }
      }
      return options;
    },

    tallyVotes: function(options){
      var winnerArr = [];
      var mostVotes = 0;
      options.forEach(function(option){
        if(option.votes === mostVotes){
          winnerArr.push(option);
        } else if(option.votes > mostVotes){
          winnerArr = [option];
          mostVotes = option.votes;
        }
      });

      //if the number of options didn't get smaller, remove one randomly 
      if( prevNumberOptions === winnerArr.length){
        //get psuedo-random index that will be the same for each user
        var middleOfArr = Math.floor(winnerArr.length/2);
        var index = hashFn('' + winnerArr[middleOfArr].title, winnerArr.length - 1);
        winnerArr.splice(index, 1);
      }
      //update new number of options
      prevNumberOptions = winnerArr.length;

      return winnerArr;
    }
  }
})

.factory( 'Lobby', function( $http ) {
  return {
    getUsersInOneSession: function( sessionName ) {
      return $http.get( '/api/sessions/users/' + sessionName )
      .then( function( res ) {
        return res.data;
      } , 
      function( err ) {
        console.error( err );
      } );
    }
  }
})

.factory ('FetchMovies', function($http) {
  var moviesArr = [];
  return {
    getMoviesArr: function(){
      return moviesArr;
    }, 

    getMovies: function (genreId) {
      return $http.get('/api/movies/' + genreId)
        .then(function(res) {
          moviesArr = res.data;
          return res.data;
        })
        .catch(function(err) {
          console.error(err);
        });
    }
  }
})

.factory ('FetchGenres', function($http) {
  var genresArr = [];
  return {
    getGenresArr: function(){
      return genresArr;
    }, 

    getAllGenres: function () {
      return $http.get('/api/genres/')
        .then(function(res) {
          genresArr = res.data;
          return res.data;
        })
        .catch(function(err) {
          console.error(err);
        }); 
    },

    getGenre: function (genre) {
      return $http.get('/api/genre/' + genre)
        .then( function(res) {
          return res.data;
        })
        .catch(function(err) {
          console.error(err);
        }); 
    }
  };
});
