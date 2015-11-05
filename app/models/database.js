/**
 * Created by krunal on 11/4/15.
 */



var Database = function(){
    this.measurementModel = require('./measurement');
    this.measurementValidatorSchema = require('./measurementValidatorSchema');
    this.statModel = require('./stat');
    this.statValueModel = require('./stat_value');
    this.measureList = [];

};

module.exports = new Database();