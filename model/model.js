// const modelItem = require('./modelItem.js')
var express = require('express');
var app = express();
var fs = require("fs");
const model = require('../model/model')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
 var id = 1; //global vatiable to represent all the id
 let modelMap = new Map();

 function moddelItem(id,type,datetime,status,fileName){
           this.id = id;
           this.type = type;
           this.datetime = datetime;
           this.status = status;
           this.fileName = fileName;
           this.annomalyFile = null;
   }

function writeTrain(req, res, data) {
    let csvHeader = []
    for (const property in data) {
       csvHeader.push({ id: property, title: property });
    }
    var path = '../model/train' + (id++) +'.csv'

    const csvWriter = createCsvWriter({
       path: path,
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
    let modelItem = new moddelItem(id,req.query.model_type,new Date(),"ready",path);
    modelMap.set(modelItem.id,modelItem);
 // let moddelItem = new moddelItem();
    return modelItem;
}

function createAnnomalyFile(itemID,data){
   let csvHeader = []
   for (const property in data) {
      csvHeader.push({ id: property, title: property });
   }
   var path = '../model/anommaly' + (itemID) +'.csv'

   const csvWriter = createCsvWriter({
      path: path,
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

   modelItem = modelMap.get(parseInt(itemID));
   modelItem.annomalyFile = path;

}

function isMoudoleExsist(itemID){
   if(modelMap.has(parseInt(itemID))){
      return modelMap.get(parseInt(itemID));
   }
   else{
      return null;
   }
}

function deleteModel(itemID){
   modelMap.delete(parseInt(itemID));
}

function getModels(){
   return modelMap;
}

module.exports = {
    writeTrain,isMoudoleExsist,deleteModel,getModels,createAnnomalyFile
};
