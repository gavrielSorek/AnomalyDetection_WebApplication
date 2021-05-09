const cppFile = require('./AnomalyDetector');
var detector = new cppFile.SimpleAnomalyDetectorJS("132");
detector.LearnNormal("..\\testsCsv\\reg_flight.csv",AsyncWorkerCompletion);
//console.log("runSimpleAsyncWorker returned '"+result+"'.");


function AsyncWorkerCompletion (err, result) {

    if (err) {
        console.log("anomaly detector returned an error: ", err);
    } else {
        console.log("anomaly detector returned '"+result+"'.");
        detector.DetectAnomalies("..\\testsCsv\\anomaly_flight.csv",Anomalies);
        
            }
    
};

function Anomalies(err, result) {
    console.log(result);
    detector.DeleteDetector();

}
