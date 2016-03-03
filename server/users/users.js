var db = require( '../config/db' );
var Sequelize = require( 'sequelize' );

var User = db.define( 'users', {
	username : Sequelize.STRING,
	password : Sequelize.STRING
} );

User.sync().then( function() {
  console.log( "users table created" );
})
.catch( function( err ) {
  console.error( err );
});

module.exports = User;
