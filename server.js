// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');
var _          = require('underscore');
var Indicative = new(require("indicative"));

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

var port     = process.env.PORT || 8080; // set our port

//building models
var Measurement = function (timestamp,temperature,dewPoint,precipitation) {
	this.timestamp = timestamp;
	this.temperature = temperature|0;
	this.dewPoint = dewPoint|0;
	this.precipitation = precipitation|0;
};
var Stat = function(metric,stat,value){
	this.metric = metric;
	this.stat = stat;
	this.value = value;
}
var listMeasurement = [];

//Validator Schema
var MeasurementSchema   = {
	timestamp   : 'required|string',
	temperature   : 'required|number',
	dewPoint      : 'required|number',
	precipitation : 'required|number'
};
//date regular expression
var dateRe = new RegExp("^\d{4}-\d{1,2}-\d{1,2}$");
var data  = {
	email                  : "doe@example.com",
	name                   : "doe",
	password               : "iamdoe",
	password_confirmation  : "iamdoe"
};
// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	console.log(listMeasurement);
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
});

// on routes that end in /measurements
// ----------------------------------------------------
router.route('/measurements')
	// Feature: Add a measurement
	// add a measurement (accessed at POST http://localhost:8080/api/measurements)
	//todo: add validation if timestamp is already added just ignore and send error code 409 may be.
	.post(function(req, res) {
		var measurement = new Measurement();
		measurement.timestamp = req.body.timestamp;
		measurement.dewPoint = isNaN(parseFloat(req.body.dewPoint))?"Not a Number":parseFloat(req.body.dewPoint);
		measurement.precipitation = isNaN(parseFloat(req.body.precipitation))?"Not a Number":parseFloat(req.body.precipitation);
		measurement.temperature = isNaN(parseFloat(req.body.temperature))?"Not a Number":parseFloat(req.body.temperature);
		//validations
		Indicative
			.validate(MeasurementSchema,measurement)
			.then(function(validation_passed){
				// validation passed
				console.log(validation_passed);
				console.log(req.body);
				listMeasurement.push(measurement);
				//res.json(measure);
				res.status(201).send();
			})
			.catch(function(error){
				// validation errors
				console.log(error)
				res.status(400).send();
			});

	})

	// get all the bears (accessed at GET http://localhost:8080/api/measurements)
	.get(function(req, res) {
		res.json(listMeasurement);
	})


// on routes that end in /measurements/:timestamp
//todo: try to find out reg expression and validate
// ----------------------------------------------------
router.route('/measurements/:timestamp')
	// get the measurement with that timestamp
	.get(function(req, res, next) {
		//check with regular expression for validation.

		//date check:

		console.log(/^\d{4}-\d{1,2}-\d{1,2}$/.test(req.params.timestamp));
		if(/^\d{4}-\d{1,2}-\d{1,2}$/.test(req.params.timestamp)){
			console.log(req.params);
			next();
		}
		var item = _.find(listMeasurement, function(measure){ return measure.timestamp == req.params.timestamp; });
		if(item)
			res.json(item);
		else
			res.status(400).send();


	})
	//Feature : Update a measurement
	.put(function(req, res) {
		console.log(req.params);
		console.log(req.body);
		var measurement = new Measurement();
		measurement.timestamp = req.body.timestamp;
		for(var key in req.body){
			if(key!='timestamp')
				measurement[key] = isNaN(parseFloat(req.body[key]))?"Not a Number":parseFloat(req.body[key]);
		}
		//validations
		Indicative
			.validate(MeasurementSchema,measurement)
			.then(function(validation_passed){
				// validation passed

				if(measurement.timestamp != req.params.timestamp){
					//case when mismatched timestamps
					res.status(409).send();
				}

				//find that entry.
				var item = _.find(listMeasurement, function(measure){ return measure.timestamp == req.params.timestamp; });
				if(item){
					//update that item.
					for(var key in req.body) {
						if (key != 'timestamp')
							item[key] = measurement[key];
					}

					res.status(204).send();
				}
				else{
					//case when measurement that does not exist
					res.status(404).send();
				}
			})
			.catch(function(error){
				// validation errors
				//case 1: when input is wrong
				res.status(400).send();
			});

	})
	//Feature : Update a measurement
	.patch(function(req, res) {

		var measurement = new Measurement();
		measurement.timestamp = req.body.timestamp;
		for(var key in req.body){
			if(key!='timestamp')
				measurement[key] = isNaN(parseFloat(req.body[key]))?"Not a Number":parseFloat(req.body[key]);
		}

		//validations
		Indicative
			.validate(MeasurementSchema,measurement)
			.then(function(validation_passed){
				// validation passed

				if(measurement.timestamp != req.params.timestamp){
					//case when mismatched timestamps
					res.status(409).send();
				}

				//find that entry.
				var item = _.find(listMeasurement, function(measure){ return measure.timestamp == req.params.timestamp; });
				if(item){
					//update that item.
					for(var key in req.body) {
						if (key != 'timestamp')
							item[key] = measurement[key];
					}
					res.status(204).send();
				}
				else{
					//case when measurement that does not exist
					res.status(404).send();
				}
			})
			.catch(function(error){
				// validation errors
				//case 1: when input is wrong
				res.status(400).send();
			});

	})
	//Feature: Delete a measurement
	.delete(function(req, res) {
		//find item having that timestamp.

		var item = _.find(listMeasurement, function(measure){ return measure.timestamp == req.params.timestamp; });
		if(item){
			//delete that item.
			listMeasurement = _.reject(listMeasurement, function(measure){ return measure.timestamp == item.timestamp; });

			res.status(204).send();
		}
		else{
			//case when measurement that does not exist
			res.status(404).send();
		}
	});


// on routes that end in /measurements/:date
//todo : complete
// ----------------------------------------------------
router.route('/measurements/:date')
	// get the measurement with that date
	.get(function(req, res) {
		//check with regular expression for validation.
		if(/^\d{4}-\d{1,2}-\d{1,2}$/.test(req.params.date)){
			// validation passed
			var measurements = [];
			_.each(listMeasurement,function(item){
				console.log(item);
				if(item.timestamp.indexOf(req.params.date)>=0){
					measurements.push(item);
				}
			});
			measurements.length>0?res.json(measurements):res.status(404).send();
		}
		else{
			res.status(400).send();
		}

	});


// on routes that end in /stats
// ----------------------------------------------------
router.route('/stats')
	.get(function(req, res) {
		console.log(req.query);
		var fromDate;
		var toDate;
		var listState = [];
		if(_.has(req.query, "fromDateTime")&&_.has(req.query, "toDateTime")){

			fromDate = new Date(req.query.fromDateTime);
			toDate = new Date(req.query.toDateTime);
		}
		else
			res.status(400).send();

		if(_.has(req.query, "stat")){
			_.each(req.query.stat,function(stat){

			})
		}
		res.send('OK');
	});

// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
