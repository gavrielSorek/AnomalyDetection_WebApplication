//imports
var express = require('express');
var app = express();
var fs = require("fs");
const model = require('../model/model')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
 var id = 1; //global vatiable to represent all the id

function writeTrain(req, res, data) {
    let csvHeader = []
    for (const property in data) {
       csvHeader.push({ id: property, title: property });
    }
 
    const csvWriter = createCsvWriter({
       path: '../model/train' + (id++) +'.csv',
       header: csvHeader
    });
 
    var i;
    var attrObjArry = [];
    for (i = 0; i < data[csvHeader[0].id].length; i++) { //create array of object that contain the info of data accordingly to the titles
       var singleObj = {};
       for (const property in data) {
          singleObj[property] = data[property][i];
       }
       attrObjArry.push(singleObj);
    }
    csvWriter.writeRecords(attrObjArry);
}
module.exports = {
    writeTrain
};
