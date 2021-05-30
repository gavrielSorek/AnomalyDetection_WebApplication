const results = [];
var globalLearnjsonObject = null;
var globalDetectjsonObject = null;
var globalAnomaliesJsonObject = {};
var globalAnomaliesJsonLIST = {};

var globalData = null;

var globalTest = "test"

console.log("the application up")

//call function every 5 sec
var intervalId = window.setInterval(function(){
  getModels();
}, 5000);

//variables definition
const detectButton = document.getElementById("detectButton");
const learnButton = document.getElementById("learnButton");
var modelsSelectList = document.getElementById("modelsSelectList");
var modelIDtoDelete = document.getElementById("deleteModelId")
const title = document.getElementById("title");

document.getElementById('modelsSelectList').addEventListener('change', function() {
  //console.log('You selected:', this.value);
  modelIDtoDelete.value= this.value;
});

function addNewModel() {
    modelType = checkClicked();
    createNewModel(modelType, globalLearnjsonObject);
}

function addAnomalies() {
  const modelId = document.getElementById("detectModelId").value;
  detectAnomalies(modelId, globalDetectjsonObject);
}

//delete everything 
clear.addEventListener("click", alertAndDelete);
function alertAndDelete() {
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
    }).then((result) => {
        if (result.value) {
            Swal.fire("Deleted!", "Your file has been deleted.", "success");
            setTimeout(deleteEverything, 900);
        } else {
            Swal.fire("Cancelled", "Your imaginary file is safe :)", "error");
        }
    });
}

function deleteEverything() {
    localStorage.clear();
    location.reload();
}

//learn drop off 
document.querySelectorAll(".drop-zone__input-learn").forEach((inputElement) => {
  const dropZoneElement = inputElement.closest(".drop-zone-learn");

  dropZoneElement.addEventListener("click", (e) => {
    inputElement.click();
  });

  //for the case of click to upload file
  inputElement.addEventListener("change", (e) => {
    const reader = new FileReader();
    if(inputElement.files[0] ==null)
    return;
    if(!inputElement.files[0].name.toLowerCase().endsWith(".csv")) {
      Swal.fire({
        title: "Error",
        text: "Please upload a csv file",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
    });
    } else {
      updateThumbnail(dropZoneElement, inputElement.files[0]);
      reader.onload = function () {
        const lines = reader.result.split(/\r?\n/).map(function(line) {
            return line.split(',')
        })
        
        globalData = lines;
        createSelectList(lines[0]);
        createTable(lines, null);

        var jsonObject = CSVToJSON(lines);
        globalLearnjsonObject = jsonObject;
        globalAnomaliesJsonObject = {};
    }
    reader.readAsText(inputElement.files[0]);
    document.getElementById("learnButton").removeAttribute('disabled');
    }
  });

  dropZoneElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZoneElement.classList.add("drop-zone-learn--over");
  });

  ["dragleave", "dragend"].forEach((type) => {
    dropZoneElement.addEventListener(type, (e) => {
      dropZoneElement.classList.remove("drop-zone-learn--over");
    });
  });

  dropZoneElement.addEventListener("drop", (e) => {
    e.preventDefault();

    if (e.dataTransfer.files.length) {
      inputElement.files = e.dataTransfer.files;
      updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
    }
    
    //for the case of drop file for upload 
    dropZoneElement.classList.remove("drop-zone--learn--over");
    const reader = new FileReader();
    reader.onload = function () {
        const lines = reader.result.split(/\r?\n/).map(function(line) {
            return line.split(',')
        })
        globalData = lines;
        createSelectList(lines[0]);
        createTable(lines, null);

        var jsonObject = CSVToJSON(lines);
        globalLearnjsonObject = jsonObject;
        globalAnomaliesJsonObject = {};
    }
    reader.readAsText(inputElement.files[0]);
    document.getElementById("learnButton").removeAttribute('disabled');
  });
});

/**
 * Updates the thumbnail on a drop zone element
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */
function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb-learn");

  // First time - remove the prompt
  if (dropZoneElement.querySelector(".drop-zone__prompt-learn")) {
    dropZoneElement.querySelector(".drop-zone__prompt-learn").remove();
  }

  // First time - there is no thumbnail element, so lets create it
  if (!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop-zone__thumb-learn");
    dropZoneElement.appendChild(thumbnailElement);
  }

  thumbnailElement.dataset.label = file.name;

  // Show thumbnail for image files
  if (file.type.startsWith("image/")) {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
    };
  } else {
    thumbnailElement.style.backgroundImage = null;
  }
}

 /*********************************************************/ 

//detect drop off 
document.querySelectorAll(".drop-zone__input-detect").forEach((inputElement) => {
  const dropZoneElement = inputElement.closest(".drop-zone-detect");

  dropZoneElement.addEventListener("click", (e) => {
    inputElement.click();
  });

  //for the case of click to upload file
  inputElement.addEventListener("change", (e) => {
    
    const reader = new FileReader();
    if(inputElement.files[0] ==null)
      return;
    if(!inputElement.files[0].name.toLowerCase().endsWith(".csv")) {
      Swal.fire({
        title: "Error",
        text: "Please upload a csv file",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
    });
    } else {
      updateThumbnail(dropZoneElement, inputElement.files[0]);
      reader.onload = function () {
        const lines = reader.result.split(/\r?\n/).map(function(line) {
            return line.split(',')
        })
        
        var jsonObject = CSVToJSON(lines);
        globalDetectjsonObject = jsonObject;

        globalData = lines;
        createSelectList(lines[0]);
        createTable(lines, null);

    }
    reader.readAsText(inputElement.files[0]);
    document.getElementById("detectButton").removeAttribute('disabled');
    }
  });

  dropZoneElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZoneElement.classList.add("drop-zone-detect--over");
  });

  ["dragleave", "dragend"].forEach((type) => {
    dropZoneElement.addEventListener(type, (e) => {
      dropZoneElement.classList.remove("drop-zone-detect--over");
    });
  });

  dropZoneElement.addEventListener("drop", (e) => {
    e.preventDefault();

    if (e.dataTransfer.files.length) {
      inputElement.files = e.dataTransfer.files;
      updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
    }
    
    //for the case of drop file for upload 
    dropZoneElement.classList.remove("drop-zone--detect--over");
    const reader = new FileReader();
    reader.onload = function () {
        const lines = reader.result.split(/\r?\n/).map(function(line) {
            return line.split(',')
        })

        var jsonObject = CSVToJSON(lines);
        globalDetectjsonObject = jsonObject;

        globalData = lines;
        createSelectList(lines[0]);
        createTable(lines, null);
        
    }
    reader.readAsText(inputElement.files[0]);
    document.getElementById("detectButton").removeAttribute('disabled');
  });
});

/**
 * Updates the thumbnail on a drop zone element
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */
function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb-detect");

  // First time - remove the prompt
  if (dropZoneElement.querySelector(".drop-zone__prompt-detect")) {
    dropZoneElement.querySelector(".drop-zone__prompt-detect").remove();
  }

  // First time - there is no thumbnail element, so lets create it
  if (!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop-zone__thumb-detect");
    dropZoneElement.appendChild(thumbnailElement);
  }

  thumbnailElement.dataset.label = file.name;

  // Show thumbnail for image files
  if (file.type.startsWith("image/")) {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
    };
  } else {
    thumbnailElement.style.backgroundImage = null;
  }
}

  //convert csv file content to JSON object
  function CSVToJSON(lines) {
    var numOfCol = lines[0].length;
    var numOfRows = lines.length;

    var js={};
    for(var i = 0 ; i < numOfCol ; i++){
      var arrayVal = [];
      var key = lines[0][i];
      for(var j = 1 ;j < numOfRows; j++){
        if(lines[j][i] != "") {
          arrayVal.push(parseFloat(lines[j][i]));
        }
      }
      js[lines[0][i]] = arrayVal;
  }
  var jsonObj = JSON.stringify(js); //JSON
  return jsonObj;
  }

  function checkClicked() {
    // Get the checkbox
    var checkBoxHybrid = document.getElementById("HybridRadio");
    var checkBoxRegression = document.getElementById("RegressionRadio");
    // If the checkbox is checked, display the output text
    if (checkBoxHybrid.checked == true){
      return "hybrid";
    } else if (checkBoxRegression.checked == true) {
        return "regression";
    }
  }

  const createNewModel = (type, jsonData) => {
    const Http = new XMLHttpRequest();
    const url='http://localhost:9876/api/model?model_type='+type;
    Http.open("POST", url);
    Http.setRequestHeader("Access-Control-Allow-Origin", "*")
    Http.setRequestHeader("Content-Type", "application/json");
    Http.send(jsonData);

    Http.onreadystatechange = (e) => {
      getModels();
      if(Http.status == 200) {
        Swal.fire({
          timer: 4000,
          title: "Success",
          text: "New model created",
          icon: "success",
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
      });
      } else if(Http.status == 400) {
        Swal.fire({
          title: "Error",
          text: "Could not create new model, Please try again",
          icon: "error",
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
      });
      }
  }
  };

  const detectAnomalies = (id, jsonData) => {
    const Http = new XMLHttpRequest();
    const url='http://localhost:9876/api/anomaly?model_id='+id;
    Http.open("POST", url);
    Http.setRequestHeader("Access-Control-Allow-Origin", "*")
    Http.setRequestHeader("Content-Type", "application/json");
    Http.send(jsonData);

    Http.onreadystatechange = (e) => {
      if(Http.status == 200) {
        Swal.fire({
          timer: 4000,
          title: "Success",
          text: "Anomalies Detected",
          icon: "success",
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
      }); 
    } else if(Http.status == 420) {
        console.log("error 420")
        Swal.fire({
          title: "Error",
          text: "Model not found, Please try again",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
      });
      } else if(Http.status == 430) {
        console.log("error 430")
        Swal.fire({
          title: "Error",
          text: "Anomaly file does not contain all features, Please try again",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
      });
      } else if(Http.status == 401) {
        console.log("error 401")
        Swal.fire({
          title: "Error",
          text: "Model's status is pending, Please wait",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
      });
      }
     
     var response = Http.responseText;
     if(response.length > 0) {
      globalAnomaliesJsonObject = JSON.parse(Http.responseText);
      fromGlobalAnomaliesToListAnomalies();
      createTable(globalData, globalAnomaliesJsonLIST);
     } else {
       globalAnomaliesJsonObject = {"anomalies":{}, "reason":{}}
       fromGlobalAnomaliesToListAnomalies();
       createTable(globalData, globalAnomaliesJsonLIST);
     }
  }
  };

 async function fromGlobalAnomaliesToListAnomalies(){
    let finalList={};
  
    var input = globalAnomaliesJsonObject["anomalies"];
    Object.keys(input).forEach((k, v) => {
   
      finalList[k]=[];
    
    
    for(var j = 0 ; j <input[k].length ; j++){
   
      let sItem = input[k][j];
    
      finalList[k].push(sItem[0]);
      var loopInt =sItem[0];
      //push from start to end-1;
      while(loopInt+1 < sItem[1]){
        finalList[k].push(++loopInt);
       }
      }
    })
globalAnomaliesJsonLIST = finalList;

      return finalList;
    }

  function createTable(data, anomalyData) {
    var myTableDiv = document.getElementById("myDynamicTable");
    myTableDiv.innerHTML="";
  
    var table = document.createElement('TABLE');
    table.border = '1';
  
    var tableBody = document.createElement('TBODY');
    table.appendChild(tableBody);

    var numOfCol = data[0].length;
    var numOfRows = data.length;
  
    for (var i = 0; i < numOfRows; i++) {
      var tr = document.createElement('TR');
      if(i==0){
        tr.style.backgroundColor = 'RGBA(0,2,90,1)';
        tr.style.width="50%";
        tr.style.color='#FFFFFF';
      }
      if(i !=0 && i%2 ==0 ){
        tr.style.backgroundColor = '#E5E8E8';
      }
      if( i%2 !=0 ){
        tr.style.backgroundColor = '#FFFFFF';
      }
      tr.style.boxShadow = '0px 0px 9px 0px rgba(0,0,0,0.1)';
      tr.style.textAlign = 'center'
      tr.style.justifyContent = 'space-between'
      tableBody.appendChild(tr);
  
      for (var j = 0; j < numOfCol; j++) {
        var td = document.createElement('TD');
        td.width = '200';
        td.appendChild(document.createTextNode(data[i][j]));
        
        let nameCol = String(data[0][j]);
        xAnomaliesArr = [];
      
      if(anomalyData) {
          if(anomalyData[nameCol]) {
            xAnomaliesArr = anomalyData[nameCol];
          //check if in this specif row(i) was anomaly
          for(var k = 0 ; k < xAnomaliesArr.length ; k++) {
            if(i == xAnomaliesArr[k]) {
              td.style.color='#FF0000';
            }
          }
        }
      }

        tr.appendChild(td);
      }
    }
    myTableDiv.appendChild(table);
  }

  function getColumn() {
    var columnNumber;
    var colNames = globalData[0];
    var currentColName = document.getElementById("chartType").value; 
    for(var i = 0 ; i < colNames.length ; i++) {
      var result = currentColName.localeCompare(colNames[i]);
      if(result == 0) {
        columnNumber = i;
        break;
      }
    }
    return globalData.map(function(row) {
        return row[columnNumber];
    });
}

function getColumnByName(colName) {
  var columnNumber;
  var colNames = globalData[0];
  var currentColName = colName;
  for(var i = 0 ; i < colNames.length ; i++) {
    var result = currentColName.localeCompare(colNames[i]);
    if(result == 0) {
      columnNumber = i;
      break;
    }
  }
  return globalData.map(function(row) {
      return row[columnNumber];
  });
}

function updateGraph() {
  var col = getColumn();
  var strGlobalAnomaliesJsonObject = JSON.stringify(globalAnomaliesJsonLIST);
  if(strGlobalAnomaliesJsonObject.localeCompare("{}") == 0) {
    createNewGraph(col, null, {});
  } else {
    createNewGraph(col, globalAnomaliesJsonLIST,globalAnomaliesJsonObject["reason"]);
  }
}

function createSelectList(items) {
  var chartType = document.getElementById("chartType");
  //remove the old options from the list if exist
  var i, L = chartType.options.length - 1;
  for(i = L; i >= 0; i--) {
    chartType.remove(i);
  }
  //Create and append the options
  for (var i = 0; i < items.length; i++) {
      var option = document.createElement("option");
      option.setAttribute("value", items[i]);
      option.text = items[i];
      chartType.appendChild(option);
  }
}

//create graph from array
function createNewGraph(colData, anomalyData, reason) {
  var xArr = [];
  var yArr = [];
  var colName = colData[0];
  var yCorArr = [];

  var anomalyCorFlag = 0;
  var strReason = JSON.stringify(reason);
  var colCorName = ""
  let colCorData = "{}";
  if(strReason.localeCompare("{}") == 0) {
    colCorName = ""
    colCorData = "{}";
  } else {
    if(reason.hasOwnProperty(colName)) {
      anomalyCorFlag = 1;
      colCorName = reason[colName];
      colCorData = getColumnByName(colCorName);
    }
  }

  var anomaliesBubbleData = [];
  var xAnomaliesArr = [];
  var yAnomaliesArr = [];


  if(anomalyData) {
    Object.keys(anomalyData).forEach(function(key) {
      if(key == colName) {
        xAnomaliesArr = anomalyData[key];
      }
    })
  }

  if(xAnomaliesArr) {
    for(var i = 0; i < xAnomaliesArr.length; i++) {
      
      jsonItemTst = {
        x: xAnomaliesArr[i].toString(),
        y: colData[xAnomaliesArr[i]],
        r: 5
      };
    
      anomaliesBubbleData.push(jsonItemTst);
    }
  }

  for (let i = 1; i < colData.length; i++) {
    xArr.push(i.toString());
  }
  
  for(var i = 1; i < colData.length; i++) {
    yArr.push(colData[i]);
  }

  if(strReason.localeCompare("{}") != 0) {
    for(var i = 1; i < colCorData.length; i++) {
      yCorArr.push(colCorData[i]);
  }
  }
  
  if(anomalyCorFlag) {
    myData = {
      labels: xArr,
      datasets: [{
        type: 'bubble',
        label: 'Anomalies',
        data: anomaliesBubbleData,
        backgroundColor: 'rgb(255, 99, 71, 1)',
        borderColor: 'rgb(255, 99, 71)',
        fill: true,
        cubicInterpolationMode: 'monotone',
        tension: 0.4
      },
      {
          label: colData[0],
          data: yArr,
          backgroundColor: 'RGBA(0,2,90,0.25)',
          borderColor: 'RGBA(0,2,90,1)',
          fill: true,
          cubicInterpolationMode: 'monotone',
          tension: 0.4
        }, 
        {
          label: colCorName,
          data: yCorArr,
          backgroundColor: 'RGBA(175, 238, 238, 0.25)',
          borderColor: 'RGB(175, 238, 238)',
          fill: true,
          cubicInterpolationMode: 'monotone',
          tension: 0.4
        }
      ]
  };
  } else { 
    myData = {
      labels: xArr,
      datasets: [{
        type: 'bubble',
        label: 'Anomalies',
        data: anomaliesBubbleData,
        backgroundColor: 'rgb(255, 99, 71, 1)',
        borderColor: 'rgb(255, 99, 71)',
        fill: true,
        cubicInterpolationMode: 'monotone',
        tension: 0.4
      },
      {
          label: colData[0],
          data: yArr,
          backgroundColor: 'RGBA(0,2,90,0.25)',
          borderColor: 'RGBA(0,2,90,1)',
          fill: true,
          cubicInterpolationMode: 'monotone',
          tension: 0.4
        }
      ]
  };
  }

  
var options = {
  responsive: true,
  maintainAspectRatio: false,
  legend: {
     fontColor: 'RGBA(0,2,90,1)',
  },
  scales: {
     xAxes: [{
        ticks: {
           fontColor: 'RGBA(0,2,90,1)',
        },
        gridLines: {
          zeroLineColor: 'RGBA(0,2,90,1)'
      }
     }],
     yAxes: [{
        ticks: {
           fontColor: 'RGBA(0,2,90,1)',
           beginAtZero: true,
           
        },
        gridLines: {
          zeroLineColor: 'RGBA(0,2,90,1)'
      }
     }]
  }

};

// Default chart defined with type: 'line'
Chart.defaults.global.defaultFontFamily = "monospace";
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
type: 'line',
data: myData,
options: options
});

}

function getModels () {
  const Http = new XMLHttpRequest();
  const url='http://localhost:9876/api/models';
  Http.open("GET", url);
  Http.withCredentials = false;
  Http.setRequestHeader("Content-Type", "application/json");
  Http.send();
  Http.onreadystatechange = (e) => {
    
    var response = Http.responseText;
    if(response.length > 0) {
      var jsonResponse = JSON.parse(Http.responseText);
      updateModelsList(jsonResponse);
    }
  }
}

function updateModelsList(modelsData) {
  var selectID = modelsSelectList.value;
  //remove the old options from the list if exist
  var i, L = modelsSelectList.options.length - 1;
  for(i = L; i >= 0; i--) {
    modelsSelectList.remove(i);
  }

  for(var i = 0; i < modelsData.length; i++) {
    modelItem = modelsData[i]
    var id = modelItem["model_id"]
    //var time = modelItem["upload_time"]
    var status = modelItem["status"]
    var option = document.createElement("option");
    var modelInfo = "model ID:   " + id + "     status: " + status;
    option.setAttribute("value", id);
    option.setAttribute("model_id",id);
    option.text = modelInfo;
    modelsSelectList.appendChild(option);
    if(selectID==id)
      modelsSelectList.value=id;
  }
}

function deleteModel(){
  let id = modelIDtoDelete.value;
  const Http = new XMLHttpRequest();
  const url='http://localhost:9876/api/model?model_id='+ id;
  Http.open("DELETE", url);
  Http.setRequestHeader("Access-Control-Allow-Origin", "*")
  Http.send();
  
  Http.onreadystatechange = (e) => {
    modelIDtoDelete.value=0;
    getModels();
    if(Http.status == 200) {
      Swal.fire({
        timer: 4000,
        title: "Success",
        text: "Model "+id+" deleted successfully",
        icon: "success",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
    });
    } else if(Http.status == 400) {
      Swal.fire({
        title: "Error",
        text: "Could not delete model " + id +", Please try again",
        icon: "error",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
    });
    }
    }
}


  
  
  

