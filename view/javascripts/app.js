const results = [];
var globaljsonObject
var globalDetectjsonObject
var globalType;
var globalData;
var globalId = 1;

console.log("the application up")

//variables definition
const addButton = document.getElementById("addButton");
const title = document.getElementById("title");


function addNewModel(e) {
    e.preventDefault();
    globalType = checkClicked();
    console.log(globalType);
    createNewModel(globalType, globaljsonObject);
    return false;
}

function addAnomalies() {
  detectAnomalies(globalId, globaljsonObject);
}

/*
//add new model
addButton.addEventListener("click", addModel);
function addModel() {
    console.log("click on +");
    globalType = checkClicked();
    console.log(globalType);
    createNewModel(globalType, globaljsonObject);
}
*/

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

//drop off 
document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
    const dropZoneElement = inputElement.closest(".drop-zone");
  
    dropZoneElement.addEventListener("click", (e) => {
      inputElement.click();
    });
  
    //for the case of click to upload file
    inputElement.addEventListener("change", (e) => {
      if (inputElement.files.length) {
        updateThumbnail(dropZoneElement, inputElement.files[0]);
      }
      const reader = new FileReader();
      reader.onload = function () {
          const lines = reader.result.split(/\r?\n/).map(function(line) {
              return line.split(',')
          })
          
          globalData = lines;
          createSelectList(lines[0]);
          createTable(lines);

          var jsonObject = CSVToJSON(lines);
          globaljsonObject = jsonObject;
          globalDetectjsonObject = jsonObject;
          console.log(jsonObject);
          
      }
      reader.readAsText(inputElement.files[0]);
    });
  
    dropZoneElement.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZoneElement.classList.add("drop-zone--over");
    });
  
    ["dragleave", "dragend"].forEach((type) => {
      dropZoneElement.addEventListener(type, (e) => {
        dropZoneElement.classList.remove("drop-zone--over");
      });
    });
  
    dropZoneElement.addEventListener("drop", (e) => {
        console.log("loploploplop");
      e.preventDefault();
  
      if (e.dataTransfer.files.length) {
        inputElement.files = e.dataTransfer.files;
        updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
      }
      
      //for the case of drop file for upload 
      dropZoneElement.classList.remove("drop-zone--over");
      const reader = new FileReader();
      reader.onload = function () {
          const lines = reader.result.split(/\r?\n/).map(function(line) {
              return line.split(',')
          })
          //createGraph(lines);
          createTable(lines);

          var jsonObject = CSVToJSON(lines);
          console.log(jsonObject);

      }
      reader.readAsText(inputElement.files[0]);
    });
  });
  
  /**
   * Updates the thumbnail on a drop zone element
   * @param {HTMLElement} dropZoneElement
   * @param {File} file
   */
  function updateThumbnail(dropZoneElement, file) {
    let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");
  
    // First time - remove the prompt
    if (dropZoneElement.querySelector(".drop-zone__prompt")) {
      dropZoneElement.querySelector(".drop-zone__prompt").remove();
    }
  
    // First time - there is no thumbnail element, so lets create it
    if (!thumbnailElement) {
      thumbnailElement = document.createElement("div");
      thumbnailElement.classList.add("drop-zone__thumb");
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

    console.log("the num row:", numOfRows);
    console.log("the num col:", numOfCol);

    var js={};
    for(var i = 0 ; i < numOfCol ; i++){
      var arrayVal = [];
      var key = lines[0][i];
      for(var j = 1 ;j < numOfRows; j++){
          arrayVal.push(parseFloat(lines[j][i]));
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
    Http.setRequestHeader("Content-Type", "application/json");
    Http.send(jsonData);
    return false;
  };

  const detectAnomalies = (id, jsonData) => {
    const Http = new XMLHttpRequest();
    const url='http://localhost:9876/api/anomaly?model_id=1';
    Http.open("POST", url);
    Http.setRequestHeader("Content-Type", "application/json");
    console.log("jsonData: ")
    console.log(jsonData)
    var json_res = {
      model_id: "1",
      upload_time: "2",
      status: "3"
   }
    Http.send(json_res);
    // var anomalies = Http.response();
    // console.log(anomalies);
  };

/*
//create graph from array
function createGraph(data, colIndex) {
	//var xsObj = createXS(data);
  var xsObj = {};
  xsObj[String(data[0])] = String(colIndex);
  console.log("data[0]:");
  console.log(data[0]);
  console.log("xsObj:");
	console.log(xsObj);

  var colObj = [];
  var colArray = [];
  var row = [];
  row.push(String(colIndex));
	for(var i = 0; i < data.length; i++) {
		row.push(i);
	}
  colArray.push(String(data[0]));
  for(var i = 1; i < data.length; i++) {
		colArray.push(data[i]);
	}
  colObj.push(colArray);
  colObj.push(row);


	//var colObj = createCol(data);
  console.log("colObj:");
	console.log(colObj);

	var chart = c3.generate({
		data: {
			xs: xsObj,
			columns: colObj
		},
        point: {
            show: false
        }, 
	});
}
*/


//functions for create a table
function getCells(data, type) {
    return data.map(cell => `<${type}>${cell}</${type}>`).join('');
  }
  
  function createBody(data) {
    return data.map(row => `<tr>${getCells(row, 'td')}</tr>`).join('');
  }
  
  function createTable(data) {
    const [headings, ...rows] = data;
    return `
      <table>
        <thead>${getCells(headings, 'th')}</thead>
        <tbody>${createBody(rows)}</tbody>
      </table>
    `;
  }
  
  //document.body.insertAdjacentHTML('afterbegin', createTable(data));

  function createTable(data) {
    var myTableDiv = document.getElementById("myDynamicTable");
  
    var table = document.createElement('TABLE');
    table.border = '1';
  
    var tableBody = document.createElement('TBODY');
    table.appendChild(tableBody);

    var numOfCol = data[0].length;
    var numOfRows = data.length;
  
    for (var i = 0; i < numOfRows; i++) {
      var tr = document.createElement('TR');
      tr.style.backgroundColor = '#ffffff';
      tr.style.boxShadow = '0px 0px 9px 0px rgba(0,0,0,0.1)';
      tr.style.textAlign = 'center'
      tr.style.justifyContent = 'space-between'
      tableBody.appendChild(tr);
  
      for (var j = 0; j < numOfCol; j++) {
        var td = document.createElement('TD');
        td.width = '200';
        td.appendChild(document.createTextNode(data[i][j]));
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


function updateGraph() {
  console.log("click on element from the list, the index is:")
  console.log(document.getElementById("chartType").value);
  var col = getColumn();
  createNewGraph(col);
}


function createSelectList(items) {
  var chartType = document.getElementById("chartType");
  //Create and append the options
  for (var i = 0; i < items.length; i++) {
      var option = document.createElement("option");
      option.setAttribute("value", items[i]);
      option.text = items[i];
      chartType.appendChild(option);
  }
}


//create graph from array
function createNewGraph(colData) {
	var xArr = [];
  var yArr = [];

  for (let i = 0; i < colData.length; i++) {
    xArr.push(i.toString());
  }

  console.log("xArr:");
  console.log(xArr);

  for(var i = 1; i < colData.length; i++) {
		yArr.push(colData[i]);
	}
  console.log("yArr:");
  console.log(yArr);

  myData = {
    labels: xArr,
    datasets: [{
        label: colData[0],
        data: yArr,
        backgroundColor: 'rgb(129, 207, 224, 0.25)',
        borderColor: 'rgb(129, 207, 224)',
        fill: true,
        cubicInterpolationMode: 'monotone',
        tension: 0.4
      }]
};

var options = {
  responsive: true,
  maintainAspectRatio: false,
  legend: {
     fontColor: 'rgb(129, 207, 224)',
  },
  scales: {
     xAxes: [{
        ticks: {
           fontColor: 'rgb(129, 207, 224)',
        },
        gridLines: {
          zeroLineColor: 'rgb(129, 207, 224)'
      }
     }],
     yAxes: [{
        ticks: {
           fontColor: 'rgb(129, 207, 224)',
           beginAtZero: true,
           maxTicksLimit: 5,
           stepSize: Math.ceil(250 / 5),
           max: 250
        },
        gridLines: {
          zeroLineColor: 'rgb(129, 207, 224)'
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



  
  
  