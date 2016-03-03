var app = angular.module( 'moviematch', [
  'ngRoute',
  'moviematch.auth',
  'moviematch.selected',
  'moviematch.selectingOption',
  'moviematch.sessions',
  'moviematch.services',
  'moviematch.lobby',
  'moviematch.genres',
  'btford.socket-io',
  'moviematch.directive',
  'moviematch.dstValidateUser'
  ])

.config( function ( $routeProvider, $httpProvider ) {
  $routeProvider
    .when( '/signin', {
      templateUrl: 'app/auth/signin.html',
      controller: 'AuthController'
    })
    .when( '/signup', {
      templateUrl: 'app/auth/signup.html',
      controller: 'AuthController'
    })
    .when( '/signout', {
      templateUrl: 'app/auth/signout.html',
      controller: 'AuthController'
    })
    .when( '/selectingOption/:category', {
      templateUrl: 'app/selectingOption/selectingOption.html',
      controller: 'SelectingOptionController',
      authenticate: true
    })
    .when( '/genres', {
      templateUrl: 'app/genres/genres.html',
      controller: 'GenresController',
      authenticate: true
    })
    .when( '/sessions', {
      templateUrl: 'app/sessions/joinsessions.html',
      controller: 'SessionsController',
      authenticate: true
    })
    .when( '/lobby', {
      templateUrl: 'app/lobby/lobby.html',
      controller: 'LobbyController',
      authenticate: true
    })
    .when( '/selected/:category', {
      templateUrl: 'app/selected/selected.html',
      controller: 'SelectedController',
      authenticate: true
    })
    .otherwise({
      redirectTo: '/signin'
    })

    $httpProvider.interceptors.push('AttachTokens');

})

.factory('AttachTokens', function ($window) {
  var attach = {
    request: function (object) {
      var jwt = $window.localStorage.getItem('com.moviematch');
      if (jwt) {
        object.headers['x-access-token'] = jwt;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
  return attach;
})

.run(function ($rootScope, $location, Auth) {
  $rootScope.$on('$routeChangeStart', function (evt, next, current) {
    if (next.$$route && next.$$route.authenticate && !Auth.isAuth()) {
      $location.path('/signin');
    }
  });
});

