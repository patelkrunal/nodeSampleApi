// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');
var _          = require('underscore');

//host and port from cli
var hostIndex = _.indexOf(process.argv,"--host");
if(hostIndex > -1){
    if(process.argv[hostIndex+1])
        process.env.HOST = process.argv[hostIndex+1];
}
var portIndex = _.indexOf(process.argv,"--port");
if(portIndex > -1){
    if(process.argv[portIndex+1])
        process.env.PORT = process.argv[portIndex+1];
}

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.set('port', process.env.PORT || 8080);// set default port
app.set('host', process.env.HOST || 'localhost');//set default host

//add all the routes.
var router = require('./app/routes/routes');

// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(app.get('port'), function(){
    console.log("Express server listening at %s:%s ",app.get('host'),app.get('port'));
});
