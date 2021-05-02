var express = require('express');
var app = express();
var fs = require("fs");

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())


//csv
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
app.post('/api/model', function (req, res, next) { //next requrie (the function will not stop the program)
   const type = req.query.model_type; //type = hybrid/regression
   //console.log(type);
   const data = req.body; //data is the ibject that the json body contain
   let csvHeader = []
   for (const property in data) {
      csvHeader.push({ id: property, title: property });
   }

   const csvWriter = createCsvWriter({
      path: 'train.csv',
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
   next();
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})