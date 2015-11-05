/**
 * Created by krunal on 11/3/15.
 */

//require everything that you need.
var router = require('express').Router();
var Indicative = new(require("indicative"));
var _          = require('underscore');
//creating database to play with.
var Database = require('../models/database');
//wiring few functions and object
var Measurement = Database.measurementModel;
//this list will contain all the measurement.
var listMeasurement = Database.measureList;
var MeasurementSchema = Database.measurementValidatorSchema;
//statistics api support models.
var Stat = Database.statModel;
var StatValue = Database.statValueModel;
var validProperty = ['timestamp', 'temperature', 'dewPoint','precipitation']
var isValidProperty = function(property){
    return (_.indexOf(validProperty,property) != -1);
};
var checkValidTimestamp = function(timestamp){
    return /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+/.test(timestamp);
};



    // middleware to use for all requests
    router.use(function(req, res, next) {
        // do logging
        next();
    });

    // test route to make sure everything is working (accessed at GET http://host:port/api)
    router.get('/', function(req, res) {
        res.json({ message: 'Capital One Assignment API is working' });
    });


    // ROUTES FOR OUR API
    // =============================================================================

    // on routes that end in /measurements
    // ----------------------------------------------------
    router.route('/measurements')
        // Feature: Add a measurement (accessed at POST http://localhost:8080/api/measurements)
        .post(function(req, res) {

            var measurement = new Measurement();
            measurement.timestamp = req.body.timestamp;
            for(var key in req.body){
                if(key!='timestamp'&&isValidProperty(key))
                    measurement[key] = isNaN(parseFloat(req.body[key]))?"Not a Number":parseFloat(req.body[key]);
            }

            //validations
            Indicative
                .validate(MeasurementSchema,measurement)
                .then(function(validation_passed){
                    //manual validation for timestamp uniqueness and regexp.
                    if(!checkValidTimestamp(measurement.timestamp)|| _.findIndex(listMeasurement,function(measure){return measure.timestamp==measurement.timestamp;})>-1){
                        res.status(400).send();
                    }else{
                        // validation passed
                        listMeasurement.push(measurement);
                        //success
                        res.status(201).send();
                    }
                })
                .catch(function(error){
                    // validation errors
                    res.status(400).send();
                });

        })

        // get all the measurements (accessed at GET http://localhost:8080/api/measurements)
        .get(function(req, res) {
            res.json(listMeasurement);
        })


    // on routes that end in /measurements/:timestamp
    // ----------------------------------------------------
    router.route('/measurements/:timestamp')
        // get the measurement with timestamp
        .get(function(req, res, next) {
            //check with regular expression for validation.
            //date check:
            if(/^\d{4}-\d{1,2}-\d{1,2}$/.test(req.params.timestamp)){
                //this will look for /measurements/:date api.
                next();
            }

            //when timestamp
            var item = _.find(listMeasurement, function(measure){ return measure.timestamp == req.params.timestamp; });
            if(item)
                res.json(item);
            else
                res.status(400).send();
        })

        //Feature : Update a measurement
        .put(function(req, res) {
            var measurement = new Measurement();
            measurement.timestamp = req.body.timestamp;
            for(var key in req.body){
                if(key!='timestamp'&&isValidProperty(key))
                    measurement[key] = isNaN(parseFloat(req.body[key]))?"Not a Number":parseFloat(req.body[key]);
            }
            //validate with Indicative plugin.
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
                        //success condition
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
                if(key!='timestamp'&&isValidProperty(key))
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
    // ----------------------------------------------------
    router.route('/measurements/:date')
        // get the measurement with that date
        .get(function(req, res) {

            //check if date is valid.
            if(/^\d{4}-\d{1,2}-\d{1,2}$/.test(req.params.date)){
                // validation passed
                var measurements = [];
                _.each(listMeasurement,function(item){
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

    router.route('/stats')
        //Feature: Get measurement statistics
        .get(function(req, res) {
            var fromDate;
            var toDate;
            var listState = [];
            if(_.has(req.query, "fromDateTime")&&_.has(req.query, "toDateTime")){
                //validating correct from and to date
                fromDate = new Date(req.query.fromDateTime);
                toDate = new Date(req.query.toDateTime);
                if(fromDate>toDate)
                    res.status(400).send();
            }
            else
                res.status(400).send();

            //result object to carry result
            var result = {};

            if(_.has(req.query, "metric")){
                //make metric list
                if(!Array.isArray(req.query.metric)){
                    req.query.metric = [req.query.metric];
                }
                _.each(req.query.metric,function(item){
                    result[item] = new StatValue();
                });
            }


            if(_.has(req.query, "stat")){

                //make stat list
                if(!Array.isArray(req.query.stat)){
                    req.query.stat = [req.query.stat];
                }

                //calculating result in one pass to save time complexity.
                _.each(listMeasurement,function(measurement){
                    var mDate = new Date(measurement.timestamp);
                    if(mDate>=fromDate && mDate<toDate){
                        _.each(result, function(metric,key){
                            if(_.has(measurement,key)){
                                if(metric.count==0) {
                                    //first encounter of that date.
                                    metric.max = measurement[key];
                                    metric.min = measurement[key];
                                }else{
                                    metric.max = measurement[key]>metric.max?measurement[key]:metric.max;
                                    metric.min = measurement[key]<metric.min?measurement[key]:metric.min;
                                }
                                metric.total += measurement[key];
                                metric.count++;
                            }
                        });
                    }
                });

                //creating stat list
                //for each metric
                _.each(result, function (value, metricKey) {
                    _.each(req.query.stat,function(stat){
                        if(stat=="average"){
                            value[stat] = value["count"]==0?0:(value["total"]/value["count"]);
                            value[stat] = Math.round( value[stat] * 10 ) / 10;
                        }
                        if(value["count"]>0)
                            listState.push(new Stat(metricKey,stat,value[stat]));
                    });
                });
                res.json(listState);
            }
            res.status(400).send();
        });


module.exports = router;
