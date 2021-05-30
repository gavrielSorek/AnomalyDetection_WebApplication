// const modelItem = require('./modelItem.js')
var express = require("express");
var app = express();
var cors = require("cors");
app.use(cors()); // to avoid the cors http errors
var fs = require("fs");
const model = require("../model/model");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var id = 1; //global vatiable to represent all the id
let modelMap = new Map();
let detectorsFile = null;

//set OS of the system
var os = getOS();
if (os == "Linux") {
  detectorsFile = require('../AnomalyDetectorByOs/linux/AnomalyDetector');
}
else if (os == "MacOS") {
  detectorsFile = require('../AnomalyDetectorByOs/mac/AnomalyDetector');
} else {
  // windows
  detectorsFile = require('../AnomalyDetectorByOs/windows/AnomalyDetector');
}

function getOS() {
  var opsys = process.platform;
  if (opsys == "darwin") {
    opsys = "MacOS";
  } else if (opsys == "win32" || opsys == "win64") {
    opsys = "Windows";
  } else if (opsys == "linux") {
    opsys = "Linux";
  }
  return opsys;
}

function moddelItem(id, type, datetime, status, fileName,modelFeatues) {
  this.id = id;
  this.type = type;
  this.datetime = datetime;
  this.status = status;
  this.fileName = fileName;
  this.annomalyFile = null;
  this.anomalyDetector = null;
  this.modelFeatues =modelFeatues;
}


function writeTrain(req, res, data, writeCsvFinished) {
  let csvHeader = [];

  for (const property in data) {
    csvHeader.push({ id: property, title: property });
  }
  
  var currentId = id++;
  let path = "";
  if (os == "Windows") {
  path = "..\\model\\train" + currentId + ".csv";
  } else {
    path = "../model/train" + currentId + ".csv";
  }
  const csvWriter = createCsvWriter({
    path: path,
    header: csvHeader,
  });

  var i;
  var attrObjArry = [];
  for (i = 0; i < data[csvHeader[0].id].length; i++) {
    //create array of object that contain the info of data accordingly to the titles
    var singleObj = {};
    for (const property in data) {
      if(data[property][i] != null) {
        singleObj[property] = data[property][i];
      }
    }
    if(JSON.stringify(singleObj) !== '{}') { //if not empty object
     attrObjArry.push(singleObj);
    }
    //console.log(singleObj);

  }
  let date = new Date();
  var now = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + "T" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + timeConvert(date.getTimezoneOffset());

  let modelItem = new moddelItem(
    currentId,
    req.query.model_type,
    now,
    "pendding",
    path,
    csvHeader
  );
  csvWriter.writeRecords(attrObjArry).then(() => {
    writeCsvFinished(modelItem);
  });
  modelMap.set(modelItem.id, modelItem);
  return modelItem;
}

function timeConvert(n) {
  var plusminus = "+";
  if(0>n)
    plusminus="-";
 // var num = n;
  var hours = (n / 60);
  var rhours = Math.floor(hours);
  var minutes = (hours - rhours) * 60;
  var rminutes = Math.round(minutes);
  if(10<rminutes && 10<rhours)
    return plusminus +Math.abs(rhours) + "." + rminutes;
  if(10<rminutes && 10>rhours)
    return plusminus+"0"+Math.abs(rhours) + "." + rminutes;
  if(10>rminutes && 10>rhours)
    return plusminus+"0"+Math.abs(rhours) + ".0" + rminutes;
  return plusminus+ Math.abs(rhours) + "." + rminutes;
  }
//create annomaly csv accordingly to data.
async function createAnnomalyFile(itemID, data) {
  let csvHeader = [];
  for (const property in data) {
    csvHeader.push({ id: property, title: property });
  }
  let path = "";
  if (os == "Windows") {
   path = "..\\model\\anommaly" + itemID + ".csv";
  } else {
   path = "../model/anommaly" + itemID + ".csv";
  }
  const csvWriter = createCsvWriter({
    path: path,
    header: csvHeader,
  });

  var i;
  var attrObjArry = [];
  for (i = 0; i < data[csvHeader[0].id].length; i++) {
    //create array of object that contain the info of data accordingly to the titles
    var singleObj = {};
    for (const property in data) {
      if(data[property][i] != null) {
        singleObj[property] = data[property][i];
      }
    }
    if(JSON.stringify(singleObj) !== '{}') {
      attrObjArry.push(singleObj);
     }
  }
  modelItem = modelMap.get(parseInt(itemID));
  modelItem.annomalyFile = path;
  return await csvWriter.writeRecords(attrObjArry)
}
//return true if model exist in the map
function isMoudoleExsist(itemID) {
  if (modelMap.has(parseInt(itemID))) {
    return modelMap.get(parseInt(itemID));
  } else {
    return null;
  }
}

function deleteModel(itemID) {
  let model = modelMap.get(parseInt(itemID));
  if (model) {
    model.anomalyDetector.DeleteDetector(); // free the anommaly detector object
    try {
      fs.unlinkSync(model.fileName);
      fs.unlinkSync(model.annomalyFile);
    } catch {
      //do nothing
    }
  }
  modelMap.delete(parseInt(itemID));
}

function getModels() {
  return modelMap;
}
//learn normal model
function learnModel(item) {
  if (item.type === "regression") {
    let simpleDetector = new detectorsFile.SimpleAnomalyDetectorJS(item.id.toString());
    item.anomalyDetector = simpleDetector;
    item.anomalyDetector.LearnNormal(item.fileName, learnFinished);
    return 200;
  } else if (item.type === "hybrid") {
    let hybridDetector = new detectorsFile.HybridAnomalyDetectorJS(item.id.toString());
    item.anomalyDetector = hybridDetector;
    item.anomalyDetector.LearnNormal(item.fileName, learnFinished);
    return 200;
  } else {
    return 400;
  }
}
//this function is execute when learnNormal finished
function learnFinished(err, result) {
  if (err) {
    //do nothing
    //console.log("error to learn model" + err);
  } else {
    var model = modelMap.get(parseInt(result));
    if (model) {
      model.status = "ready";
      //console.log("item " + result + " is ready , new state" + model.status);
    } else { //do nothing
      //console.log("Item with id" + result + "not found");
    }
  }
}
//the function update the anomalies when detection finishe.
function extractAnomalies(anomaliesStr,modelItem) {
  return getAnomaliesFromString(anomaliesStr,modelItem);
}
function getAnomaliesFromString(anomaliesStr,modelItem) {
  let jsonItem ={};
  let anomaliesObj = {};
  let correlativeFeatures = {};
  let anomalies = anomaliesStr.split('\\')[0];
  // create empty arrays for each fetaure
  for (let i = 0; i < modelItem.modelFeatues.length; i++) {
    anomaliesObj[modelItem.modelFeatues[i].id] = [];
  }
//if there are anomalies
    if(anomalies){
    anomalies = anomalies.split('^');
    for (let i = 0; i < anomalies.length; i++) {
      let line = parseInt(anomalies[i].split(',')[1]);
      let features = anomalies[i].split(',')[0].split('~');
      let feature1 = features[0];
      let feature2 = features[1];
      // if (!anomaliesObj[feature1]) { //if this feature doesnt exist yet
      //   anomaliesObj[feature1] = [];
      // }
      // if (!anomaliesObj[feature2]) { //if this feature doesnt exist yet
      //   anomaliesObj[feature2] = [];
      // }
      anomaliesObj[feature1].push(line);
      anomaliesObj[feature2].push(line);
      correlativeFeatures[feature1] = feature2;
      correlativeFeatures[feature2] = feature1;
    }
    //console.log(anomaliesObj);

  }
  jsonItem['anomalies'] = convertToSpan(anomaliesObj);
  jsonItem["reason"] = correlativeFeatures;
  //console.log(jsonItem)
  return jsonItem;
}
//return the id from anomaly string
function getIdFromAnomalies(anomalies) {
  const anomalyAndId = anomalies.split('\\');
  return anomalyAndId[1];
}
//return true if data contain the features that found in learn file.
async function isDataContainsFeaturs(features,dataToCheck){

  let dataToCheckFeaures = [];

  for (const property in dataToCheck) {
    dataToCheckFeaures.push({ id: property, title: property });
  }
 
  for (let i = 0; i < features.length; i++) {
    let isValid=false;
    let j = 0
    for (j = 0; j < dataToCheckFeaures.length; j++) {
      if(features[i].id==dataToCheckFeaures[j].id){
          isValid=true;
      }
    }
    if(!isValid){
      return false;
    }
  }
   return true;       
}
//convert anomalies line to spans
function convertToSpan(anomaliesObj) {
  let anomaliesWithSpan = {};
  for (const column in anomaliesObj) {  //add empty arrays to the new obj
    anomaliesWithSpan[column] = [];
  }
  for (const column in anomaliesObj) {
    anomaliesObj[column].sort(function(a, b) {
      return a - b;
    });
    let start = -2, end = -2;
    for (let i = 0; i < anomaliesObj[column].length; i ++) {
      if(anomaliesObj[column][i] > end + 1) { //Exceeds span , create new span
        if(end >=0) { //if valid end
          anomaliesWithSpan[column].push([start, end + 1]);
          start = anomaliesObj[column][i];
          end = start;
          if(i == anomaliesObj[column].length - 1) { //if its last element
           anomaliesWithSpan[column].push([start, end + 1]);
          }
        }  else { //if its the first element
          //console.log("first is:", anomaliesObj[column][i]);
          start = anomaliesObj[column][i];
          end = anomaliesObj[column][i];
          if(i == anomaliesObj[column].length - 1) { //if its last element (only one element in array)
           anomaliesWithSpan[column].push([start, end + 1]);
          }
        }
      } else if(i == anomaliesObj[column].length - 1) { //if its the last element (its cant be the first)
           end = anomaliesObj[column][i];
           anomaliesWithSpan[column].push([start, end + 1]);
     }else {//if the next in the span
        end = anomaliesObj[column][i];
      }
    }
  }
  return anomaliesWithSpan;
}
module.exports = {
  writeTrain,
  isMoudoleExsist,
  deleteModel,
  getModels,
  createAnnomalyFile,
  learnModel,
  extractAnomalies,
  isDataContainsFeaturs
};
