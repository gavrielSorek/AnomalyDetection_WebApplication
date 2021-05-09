id = 1;
var express = require('express');

var app = express();
var fs = require("fs");
const model = require('../model/model')
let cors = require('cors')
app.use(cors())
const MaxModels =20

//var detector = new detectorsFile.SimpleAnomalyDetectorJS("132");


var bodyParser = require('body-parser');
const { Server } = require('http');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())


app.post('/api/model', function (req, res, next) { //next requrie (the function will not stop the program)
   // check if we have already 20 models
   if(model.getModels().size >= MaxModels){
      res.status(405);
      res.send;
      next();
      return;
   }
   const type = req.query.model_type; //type = hybrid/regression
   //  console.log("the type is :" + type);
   const data = req.body; //data is the object that the json body contain
   let modelItem = model.writeTrain(req, res, data, writeCsvFinished)
   //when write csv finished we learn normal
   function writeCsvFinished(modelItem) {
      model.learnModel(modelItem);
   }
   //send to client
   if (modelItem) {
      var json_res = {
         model_id: modelItem.id,
         upload_time: modelItem.datetime,
         status: modelItem.status
      }
      res.status(200);
      res.json(json_res);
   } else {
      //failed
      res.status(400);
   }
   next();
})

app.get('/api/model', function (req, res, next) {
   const id = req.query.model_id;
   var m = model.isMoudoleExsist(id);
   // console.log("the id is " + id);
   // console.log("the item is :" + m)
   if (m) {
      var json_res = {
         model_id: m.id,
         upload_time: m.datetime,
         status: m.status
      }

      res.json(json_res);
      res.status(200);
   }
   else {
      res.status(400);
   }
   next();
})

app.delete('/api/model', function (req, res, next) {
   const id = req.query.model_id;
   var m = model.isMoudoleExsist(id);
   if (m) {
      model.deleteModel(id)
      var json_res = {
      }
     // res.header("No-Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Origin", "*");
      res.json(json_res);
      res.status(200);
      console.log("item deleted sucssfully");
   } else {
      console.log("item not found, error 400");
      res.status(200);
   }
   next();
})

app.get('/api/models', function (req, res, next) {
   var json = {};
   var modelArr = new Array();
   models = model.getModels();
   models.forEach((values, keys) => {
      jsonItem = {
         model_id: values.id,
         upload_time: values.datetime,
         status: values.status
      } 
      modelArr.push(jsonItem);
   })
json["models"] = modelArr;
 //console.log(json);
 res.header("Access-Control-Allow-Origin", "*");
 res.json(modelArr);
   res.status(200);
   next();
})

app.post('/api/anomaly', function (req, res, next) {
   const id = req.query.model_id;
   const data_to_detect = req.body; //data is the object that the json body contain
   if (!model.isMoudoleExsist(id)) {
      console.status(400);
      console.log("model does not exsist");
   }
   else {
      model.createAnnomalyFile(id, data_to_detect);
      // TODO add annomaly
   }
   next();
})

var server = app.listen(9876, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})