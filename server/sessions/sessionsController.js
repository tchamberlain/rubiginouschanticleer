var helpers = require( '../config/helpers' );
var Session = require( './sessions' );

module.exports = {

  getAllSessions: function( req, res, next ) {
    Session.findAll()
    .then( function( sessions ) {
      res.send( sessions );
    })
  },

  addSession: function( req, res, next ) {
    var sessionName = req.body.sessionName;
    var sessionCreator = req.body.sessionCreator;
    console.log('SESSION CREATED',sessionCreator );
    Session.create( {
      sessionName: sessionName,
      sessionCreator: sessionCreator
    } ).then( function() {
      res.status = 201;
      res.end();
    } )
  },
  
  getSessionByName: function( req, res, next ) {
    var sessionName = req.params.sessionName;

    Session.findOne( { where: { sessionName: sessionName } } )
    .then( function( session ) {
      res.json( session );
    }, function( err ) {
      helpers.errorHandler( err, req, res, next );
    });
  }
  
};
