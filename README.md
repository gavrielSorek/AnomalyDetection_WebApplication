# MileStone2 Web Application:
**Introduction:**

This project is a Web applictaion which represents a web anomaly detector. With this application we can detect anomalies of flight by using a web anomaly detector.

**Video demonstration:**

You can find [here!](http://google.com) the video of the project which demonstrates the features of the application.

_Application open screen:_
[![anomaly-Detector-Web.png](https://i.postimg.cc/7LhcP4wP/anomaly-Detector-Web.png)](https://postimg.cc/2qpTTP1g)
•	learn – upload normal file to designed box, the server will learn from this file.

•	detect – upload file which the client want to investigate to designed box, the server will detect anomalies and return it back to client.

•	Graphs – after uploading the anomaly file, by looking the the graphs we can see the data of our anomalies file represent by graph, and the anomalies wich marked with red dots.
We can select any feature from the feature list.

•	Table – after uploading the anomaly file, by looking the the table we can see the data of our anomalies file.

__Project Structure:__

[![project-Structure.png](https://i.postimg.cc/sxZXWbz5/project-Structure.png)](https://postimg.cc/JHMMV6Gh)

1)	AnomalyDetectorByOs –
contain native code of anomaly detector for windows ,linux and mac.
2)	controller – 
responsible of the server logic (server response logic).
This folder contains the server code. 
3)	Model –
the main and only model of the project, implements the ( ) design pattern and its responsible of the business logic of the project.
Contains the logic parts of the application such as detect anomalies by Contact the anomaly detector, parse the result from the anomaly detector and so on.
4)	view – 
This folder contains the view logic.

__Installation requirements:__

computer

__Installation Instructions:__

__UML and Restful Api pattern:__
