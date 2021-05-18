const cppFile = require('./AnomalyDetector.node');
var detector = new cppFile.SimpleAnomalyDetectorJS("132");
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
        var res = detector.DetectAnomalies("..\\testsCsv\\anomaly_flight.csv");
        console.log(res);
            }
    
};

function Anomalies(err, result) {
    console.log(result);
    //console.log(result);
    detector.DeleteDetector();

}
