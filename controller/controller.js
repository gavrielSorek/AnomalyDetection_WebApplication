id = 1;
var express = require('express');

var app = express();
app.use(express.json({limit: '500mb'}));
var fs = require("fs");
const model = require('../model/model')
let cors = require('cors')
app.use(cors())

//var detector = new detectorsFile.SimpleAnomalyDetectorJS("132");


var bodyParser = require('body-parser');
const { Server } = require('http');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(express.static("../view"));


//get view
app.get("/", function (req, res, next) { //next requrie (the function will not stop the program)
   //res.sendFile('../view/index.html' , { root : __dirname});
   //res.sendFile(path.join(__dirname, '../view/index.html'));
   //console.log(__dirname + "\\..\\view\\index.html");
   //res.sendFile(__dirname + "\\..\\view\\index.html");
   res.sendFile("index.html");

   res.status(200);
   res.end();
   next();
})

//post model
app.post('/api/model', function (req, res, next) { //next requrie (the function will not stop the program)
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
      res.end();
   } else {
      //failed
      res.status(400);
      res.end();
   }
   next();
})
//get model status
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
      res.end();
   }
   else {
      res.status(400);
      res.end();
   }
   next();
})

app.delete('/api/model', function (req, res, next) {
   const id = req.query.model_id;
   var m = model.isMoudoleExsist(id);
   if (m) {
      model.deleteModel(id)
     
      res.header("Access-Control-Allow-Origin", "*");
      res.status(200);
      console.log("item deleted sucssfully");
      res.end();
   } else {
      console.log("item not found, error 400");
      res.status(400);
      res.end();
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
   res.end();
   next();
})

app.post('/api/anomaly', async (req, res, next) => {
   const id = req.query.model_id;
   res.header("Access-Control-Allow-Origin", "*");
   const data_to_detect = req.body; //data is the object that the json body contain
   if (!model.isMoudoleExsist(id)) {
      res.status(420);
      console.log("model does not exsist");
      res.end();
      next();
   }
   let modelItem = model.getModels().get(parseInt(id));
   if(await model.isDataContainsFeaturs(modelItem.modelFeatues,data_to_detect)==false){
      res.status(430);
      console.log("annomaly file does not contains all fetures!");
      res.end();
   }
   else {
      await model.createAnnomalyFile(id, data_to_detect);
         if (modelItem) {
            if(modelItem.status !== "ready") { //still pending
               var json_res = {
                  model_id: modelItem.id,
                  upload_time: modelItem.datetime,
                  status: modelItem.status
               }    
            res.json(json_res);
               console.log("model still pending");
               res.status(401);
               res.end();
            } else { //if model is ready
            let detector = modelItem.anomalyDetector;
            res.json(await model.extractAnomalies(detector.DetectAnomalies(modelItem.annomalyFile),modelItem));
            res.status(200);
            res.end();
            }
         }
         else { //if model item not found
            res.status(420);
            console.log("model does not exsist");
            res.end();
         }
   }
   next();
})

var server = app.listen(9876, function () {
   var host = server.address().address
   var port = server.address().port
   server.maxConnections = 20;
   console.log("app listening at port: %s",port)
})