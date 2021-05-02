id = 1;
var express = require('express');
var app = express();
var fs = require("fs");
const model = require('../model/model')

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())


app.post('/api/model', function (req, res, next) { //next requrie (the function will not stop the program)
   const type = req.query.model_type; //type = hybrid/regression
   //console.log(type);
   const data = req.body; //data is the object that the json body contain
   model.writeTrain(req, res, data)
   next();
})

var server = app.listen(9876, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})