angular.module( 'moviematch.selectingOption', [] )


.controller( 'SelectingOptionController', function( $scope, Votes, Session, Socket, $location, Auth, $routeParams, FetchMovies, $timeout, FetchGenres ) {
    //*******************************************************************
   //******************** INTIALIZATION ******************************
  //******************************************************************
  var category = $location.path().split('/')[2];
  var seconds = 10;
  $scope.counter = seconds;
  $scope.optionsVotedFor = [];
  $scope.maxNumVotes = 3;

  //remove any listeners from the last time this page was visited
  Socket.removeAllListeners("voteAdded");
  Socket.removeAllListeners("win");
  Socket.removeAllListeners("tie");
  Socket.removeAllListeners("secondPassed");


  Votes.resetPrevNumberOptions();

  Session.getSession()
  .then( function( session ) {
    $scope.session = session;

    //want to check if current user created session, because only they may start the game
    var isCreator = Auth.getUserName() === $scope.session.sessionCreator;
    
    //if they are the creator they get set timer
    if(isCreator){
      setTimer(seconds);
    } 
  });

    //*******************************************************************
   //******************** FUNCTIONS ***********************************
  //******************************************************************
  $scope.vote = function(option){
    var optionIndex = $scope.optionsVotedFor.indexOf(option.id);
    var addVote;
    if(optionIndex > -1){//if already voted for that option, we will remove the vote
      addVote = false;
      $scope.optionsVotedFor.splice(optionIndex, 1);
    } else { // if not we'll add it 
      if($scope.optionsVotedFor.length < $scope.maxNumVotes){
        addVote = true;
        $scope.optionsVotedFor.push(option.id);
      } else {
        return false; //Tell D3 not to highlight the bubble
      }
    }
    voteDate = {
      sessionName: $scope.session.sessionName, 
      id: option.id, 
      addVote: addVote
    };
    Votes.addVote(voteDate);
    return true; //Tell D3 to highlight the bubble
  };

  var tallyVotes = function(){
   var winnerArr = Votes.tallyVotes($scope.options);
    if( winnerArr.length === 1 ) { //when there's a winner
      var winnerData = {
        sessionName: $scope.session.sessionName, 
        winner: winnerArr[0] 
      };
      //notify others of win
      Socket.emit('win', winnerData);
    } else { //when there's a tie

      //Reduce voting time in half
      seconds = Math.max(5,Math.floor(seconds / 2));
      var tieData = {
        sessionName: $scope.session.sessionName, 
        options: winnerArr,
        seconds: seconds  
      };
      //notify others of tie
      Socket.emit('tie', tieData, function(){
      });
      console.log('when running?')
      //reset timer
        setTimer(seconds);

    }
  }

  var setTimer = function(seconds){
    var count = seconds;
    $scope.timer = function(seconds){
      var countdown = $timeout($scope.timer,1000);
      count -= 1;
      Socket.emit( 'secondPassed', {sessionName: $scope.session.sessionName});
      if( count === 0 ){
        //when the timer reaches zero, make it stop
        $timeout.cancel(countdown);
        tallyVotes();
      }
    }
    $scope.timer();
  };

  if(category === 'genre'){//fetching genres 
    var data = FetchGenres.getGenresArr();
    data.forEach(function(option){
        option.votes = 0; 
    });
    $scope.options = data;

  } else {//fetching movies is synchronous because we already made the api call 
    var data = FetchMovies.getMoviesArr();
    data.forEach(function(option){
        option.votes = 0; 
    });
    $scope.options = data;
  }

  //*******************************************************************
 //******************** SOCKET LISTENERS *****************************
//******************************************************************
  Socket.on( 'secondPassed', function() {
    console.log('sed passed?');
    $scope.counter -= 1;
  });

  Socket.on( 'tie', function(data) {
    console.log('tie received!', data);
    //reset choices user has voted for to 0
    $scope.optionsVotedFor =[];
    $scope.counter = data.seconds;
    data.options.forEach(function(option){
      option.votes = 0; 
    });
    $scope.options = data.options;
    //only allow one vote during a tie-breakers
    $scope.maxNumVotes = 1;
  });

  Socket.on( 'win', function(data) {
    console.log('win received!', data);
    Session.setSelectedOption(data.winner);
    $location.path('/selected/'+category);
  });

  Socket.on( 'voteAdded', function(vote) {
    //update our array of options to reflect the new vote
    $scope.options = Votes.receiveVote(vote.id, $scope.options, vote.addVote);
  });

})
  //****************************************************************
 //******************** D3 **************************************
//*************************************************************

.directive('bubbles', ['$window', '$timeout', function($window, $timeout) {
  return {
    restrict: 'E',
    scope: {
      data: '='
      //sendVote: '&'
    },
    link: function(scope, ele, attrs) {
      var width = angular.element($window)[0].innerWidth,
          height = angular.element($window)[0].innerHeight,
          data = scope.$parent.options,
          fill = d3.scale.category10(),
          allNodes = null,
          allLabels = null,
          margin = {top: 0, right: 0, bottom: 0, left: 0},
          maxRadius = height/12,
          rScale = d3.scale.sqrt().range([0, maxRadius]),
          rValue = function(d) {return parseInt(d.votes)+1},//To show bubbles, we need count of at least 1
          idValue = function(d) {return d.id},
          textValue = function(d) {return d.title},
          voteValue = function(d) {return parseInt(d.votes)},
          collisionPadding = 4,
          minCollisionRadius = 12,
          jitter = 0.5;

      var tick = function(e) {
        var dampenedAlpha = e.alpha * 0.1;
        allNodes.each(gravity(dampenedAlpha))
                .each(collide(jitter))
                .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"});
        
        allLabels.style("left", function(d) {return ((margin.left + d.x) - d.dx / 2) + "px"})
                 .style("top", function(d) {return ((margin.top + d.y) - d.dy / 2) + "px"});
      };

      var force = d3.layout.force()
                    .gravity(0)
                    .charge(0)
                    .size([width, height])
                    .on("tick", tick);

      var update = function() {
        console.log('UPDATE DATA FOR D3:',data);
        maxDomainValue = d3.max(data, function(d) {return rValue(d);});

        rScale.domain([0, maxDomainValue]); //Sets the bubble sizing scale;
        data.forEach(function(d, i){return d.forceR = Math.max(minCollisionRadius, rScale(rValue(d)))});
        force.nodes(data).start();
        updateNodes();
        updateLabels();
      };

      var isPicked = function(d){return scope.$parent.optionsVotedFor.indexOf(d.id) > -1};

      var updateNodes = function() {
        allNodes = bubbleGroup.selectAll(".bubble-node").data(data, function(d) {return idValue(d)});
        //Format existing circles
        allNodes.selectAll("circle")
                .attr("r", function(d){console.log('VoteValue: ',rScale(rValue(d)));return rScale(rValue(d));});

        allNodes.exit().remove(); //Remove unused nodes

        allNodes.enter()
                .append("a")
                .attr("class", "bubble-node")
                .call(force.drag)
                .call(connectEvents)
                .append("circle")
                .attr("r", function(d){return rScale(rValue(d));});


        allNodes.selectAll("circle")
                .style("fill", function(d){return fill(rValue(d))})


        //if already highlighted, remove highlight, else highlight
        d3.selectAll(".bubble-node").classed("bubble-selected", isPicked);
      };

      var updateLabels = function() {
        allLabels = labelGroup.selectAll(".bubble-label")
                              .data(data, function(d){return idValue(d)});

        allLabels.exit().remove(); //Remove unused labels

        //Update existing labels
        allLabels.selectAll(".bubble-label")
                 .text(function(d) {return textValue(d)});

        allLabels.selectAll(".bubble-label-value")
                 .text(function(d) {console.log('VoteValue: ',voteValue(d));return voteValue(d)});

        //Add text and count to label
        var labelsEnter = allLabels.enter()
                                   .append("div")
                                   .attr("class", "bubble-label")
                                   .text(function(d) {return textValue(d)})
                                   .call(force.drag)
                                   .append("div")
                                   .attr("class", "bubble-label-value")
                                   .text(function(d) {return voteValue(d)});

        allLabels.style("font-size", function(d) {return Math.max(12, rScale(rValue(d) / 8)) + "px"})
                 .style("width", function(d) {return 2.5 * rScale(rValue(d)) + "px"});

        //Trick to get correct dx value. After getting it, we delete span
        allLabels.append("span").text(function(d) {return textValue(d)})
         .each(function(d) {
           return d.dx = Math.max(2.5 * rScale(rValue(d)), this.getBoundingClientRect().width);
         })
         .remove();

        allLabels.style("width", function(d) {return d.dx + "px"});

        /***************This -100 is not supposed to be needed ***************/
        allLabels.each(function(d){return d.dy = -425+this.getBoundingClientRect().height});
      };

      var gravity = function(alpha) {
        var cx = width / 2;
        var cy = height / 2;
        var ax = alpha / 2; // Determines the shape of the pulled together circles
        var ay = alpha / 2; // Determines the shape of the pulled together circles
        return function(d) {
          d.x += (cx - d.x) * ax;
          d.y += (cy - d.y) * ay;
        };
      };

      var collide = function(jitter) {
        return function(d) {
          data.forEach(function(d2) {
            if (d !== d2) {
              var x = d.x - d2.x;
              var y = d.y - d2.y;
              var distance = Math.sqrt(x * x + y * y);
              var minDistance = d.forceR + d2.forceR + collisionPadding;
              if (distance < minDistance) {
                distance = (distance - minDistance) / distance * jitter;
                var moveX = x * distance;
                var moveY = y * distance;
                d.x -= moveX;
                d.y -= moveY;
                d2.x += moveX;
                return d2.y += moveY;
              }
            }
          });
        };
      };

      var connectEvents = function(d) {
        d.on("click", click);
        d.on("mouseover", mouseover);
        d.on("mouseout", mouseout);
      };

      var mouseover = function(d) {
        allNodes.classed("bubble-hover", function(node) {return node === d});
      };

      var mouseout = function(d) {
        allNodes.classed("bubble-hover", false);
      };

      

      var click = function(d) {
        scope.$parent.vote(d);
        d3.event.preventDefault();
      };

      var svg = d3.select(ele[0]).selectAll("svg").data([data]);

      var svgEnter = svg.enter().append("svg");
      svg.attr("width", width);
      svg.attr("height", height);

      bubbleGroup = svgEnter.append("g")
                     .attr("id", "bubble-nodes")
                     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      labelGroup = d3.select(ele[0]).selectAll("#bubble-labels").data([data])
                                    .enter()
                                    .append("div")
                                    .attr("id", "bubble-labels");
      
      //If window size changes, reposition the bubbles
      // $window.onresize = function() {
      //   width = angular.element($window)[0].innerWidth;
      //   height = angular.element($window)[0].innerHeight;
      //   svg.attr("width", width);
      //   svg.attr("height", height);
      //   maxRadius = height/12,
      //   rScale = d3.scale.sqrt().range([0, maxRadius]),
      //   update();
      // };

      //If data changes, update the bubbles
      scope.$watch('$parent.options', function(newData) {
        if (!newData) return;
        console.log('NEW DATA ON D3:', data);
        data = newData;
        update();
      }, true);
  }}
}])