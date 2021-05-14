const cppFile = require('../AnomalyDetectorByOs/windows/AnomalyDetector');
var detector = new cppFile.HybridAnomalyDetectorJS("132");
//detector.LearnNormal("train1.csv",AsyncWorkerCompletion);
detector.LearnNormal("..\\testsCsv\\reg_flight.csv",AsyncWorkerCompletion);
//console.log("runSimpleAsyncWorker returned '"+result+"'.");

var m = {};
m["mm"] = "lal";

function AsyncWorkerCompletion (err, result) {

    if (err) {
        console.log("anomaly detector returned an error: ", err);
    } else {
        console.log("anomaly detector returned '"+result+"'.");
        //console.log(detector);
        detector.DetectAnomalies("..\\testsCsv\\anomaly_flight.csv",Anomalies);
        
            }
    
};

function Anomalies(err, result) {
    console.log(result);
    detector.DeleteDetector();

}
