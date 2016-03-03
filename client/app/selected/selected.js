angular.module( 'moviematch.selected', [] )

.controller( 'SelectedController', function( $scope, Session, Socket, $location, Auth, $timeout, $routeParams) {
  $scope.selectedOption = Session.getSelectedOption();


  var nextScreen = function(){
    $location.path('/selectingOption/movie');
  }

  //if we just chose genre, wait 3 seconds before moving on to choose movie
  if($routeParams.category == 'genre'){
    $timeout(nextScreen,3000);
  }

});