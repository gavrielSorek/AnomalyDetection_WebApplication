const cppFile = require('../AnomalyDetectorByOs/windows/AnomalyDetector.node');
var detector = new cppFile.HybridAnomalyDetectorJS("132");
//detector.LearnNormal("train1.csv",AsyncWorkerCompletion);
//detector.LearnNormal("..\\testsCsv\\reg_flight.csv",AsyncWorkerCompletion);
detector.LearnNormal("train1",AsyncWorkerCompletion);

//detector.LearnNormal("..\\testsCsv\\reg_flight.csv",AsyncWorkerCompletion);
//console.log("runSimpleAsyncWorker returned '"+result+"'.");

var m = {};
m["mm"] = "lal";

function AsyncWorkerCompletion (err, result) {

    if (err) {
        console.log("anomaly detector returned an error: ", err);
    } else {
        console.log("anomaly detector returned '"+result+"'.");
        console.log("anomaly detector returned wwwwwwwwwwwwwwwwwwwwwwww '"+result+"'.");
        //console.log(detector);
        var res = detector.DetectAnomalies("train1");
        console.log(res);
            }
    
};

function Anomalies(err, result) {
    console.log(result);
    //console.log(result);
    detector.DeleteDetector();

}
