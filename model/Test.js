const cppFile = require('./AnomalyDetectore');
var detector = new cppFile.SimpleAnomalyDetectorJS("132");
detector.LearnNormal("C:\\Users\\gavri\\Desktop\\csv\\reg_flight.csv",AsyncWorkerCompletion);
//console.log("runSimpleAsyncWorker returned '"+result+"'.");


function AsyncWorkerCompletion (err, result) {

    if (err) {
        console.log("anomaly detector returned an error: ", err);
    } else {
        console.log("anomaly detector returned '"+result+"'.");
        detector.DetectAnomalies("C:\\Users\\gavri\\Desktop\\csv\\anomaly_flight_withoutNames.csv",Anomalies);
        
            }
    
};

function Anomalies(err, result) {
    console.log(result);
    detector.DeleteDetector();

}
