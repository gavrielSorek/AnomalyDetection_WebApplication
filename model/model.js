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
console.log("os is " + os);
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

function moddelItem(id, type, datetime, status, fileName) {
  this.id = id;
  this.type = type;
  this.datetime = datetime;
  this.status = status;
  this.fileName = fileName;
  this.annomalyFile = null;
  this.anomalyDetector = null;
}


function writeTrain(req, res, data, writeCsvFinished) {
  let csvHeader = [];
  for (const property in data) {
    csvHeader.push({ id: property, title: property });
  }
  var currentId = id++;
  var path = "..\\model\\train" + currentId + ".csv";

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
      singleObj[property] = data[property][i];
    }
    attrObjArry.push(singleObj);
  }
  let date = new Date();
  var now = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + "T" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + date.getTimezoneOffset();

  let modelItem = new moddelItem(
    currentId,
    req.query.model_type,
    now,
    "pendding",
    path
  );
  csvWriter.writeRecords(attrObjArry).then(() => {
    writeCsvFinished(modelItem);
  });
  modelMap.set(modelItem.id, modelItem);
  return modelItem;
  //let modelItem = new moddelItem(currentId, req.query.model_type, new Date(), "ready", path);
  //modelMap.set(modelItem.id, modelItem);
  // let moddelItem = new moddelItem();
  //return modelItem;
}

function createAnnomalyFile(itemID, data, createAnomalyFileFinished) {
  let csvHeader = [];
  for (const property in data) {
    csvHeader.push({ id: property, title: property });
  }
  var path = "..\\model\\anommaly" + itemID + ".csv";

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
      singleObj[property] = data[property][i];
    }
    attrObjArry.push(singleObj);
  }
  modelItem = modelMap.get(parseInt(itemID));
  modelItem.annomalyFile = path;
  csvWriter.writeRecords(attrObjArry).then(() => {
    createAnomalyFileFinished(parseInt(itemID)); //when write anomaly finished need to detect anomalies 
  }).catch(()=>{console.log('dr catch')});
}

function isMoudoleExsist(itemID) {
  if (modelMap.has(parseInt(itemID))) {
    return modelMap.get(parseInt(itemID));
  } else {
    return null;
  }
}

function deleteModel(itemID) {
  let model = modelMap.get(parseInt(itemID));
  if (model)
    model.anomalyDetector.DeleteDetector(); // free the anommaly detector object 
  modelMap.delete(parseInt(itemID));
}

function getModels() {
  return modelMap;
}
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
function learnFinished(err, result) {
  if (err) {
    //need to add logic
    console.log("err:" + err);
  } else {
    var model = modelMap.get(parseInt(result));
    if (model) {
      model.status = "ready";
      console.log("item " + result + " is ready , new state" + model.status);
    } else {
      console.log("Item with id" + result + "not found");
    }
  }
}
//the function update the anomalies when detection finishe.
function extractAnomalies(anomaliesStr) {
  return getAnomaliesFromString(anomaliesStr);
}
function getAnomaliesFromString(anomaliesStr) {
  let anomalies = anomaliesStr.split('\\')[0];
  if (anomalies) { //if there are anomalies
    anomalies = anomalies.split('^');
    let anomaliesObj = {};
    for (let i = 0; i < anomalies.length; i++) {
      let line = anomalies[i].split(',')[1];
      let features = anomalies[i].split(',')[0].split('~');
      if (!anomaliesObj.features[0]) { //if this feature doesnt exist yet
        anomaliesObj.features[0] = [];
      }
      if (!anomaliesObj.features[1]) { //if this feature doesnt exist yet
        anomaliesObj.features[1] = [];
      }
      anomaliesObj.features[0].push(line);
      anomaliesObj.features[1].push(line);
    }
    return anomaliesObj;
  }
return {};
}
//return the id from anomaly string
function getIdFromAnomalies(anomalies) {
  const anomalyAndId = anomalies.split('\\');
  return anomalyAndId[1];
}
module.exports = {
  writeTrain,
  isMoudoleExsist,
  deleteModel,
  getModels,
  createAnnomalyFile,
  learnModel,
  extractAnomalies,
};
