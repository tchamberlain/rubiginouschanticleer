var db = require( '../config/db' );
var Sequelize = require( 'sequelize' );

var Session = db.define( 'sessions', {
  sessionName : Sequelize.STRING,
  sessionCreator : Sequelize.STRING
} );

Session.sync().then( function() {
  console.log( "sessions table created" );
} )
.catch( function( err ) {
  console.error( err );
} );

module.exports = Session;
