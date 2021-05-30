# MileStone2 Web Application:
**Introduction:**

This project is a Web applictaion which represents a web anomaly detector.

With this application we can detect anomalies of flight by using a web anomaly detector.

**Video demonstration:**

You can find [here!](https://www.youtube.com/watch?v=VPJ-5CoDj1M) the video of the project which demonstrates the features of the application.

_Application open screen:_
[![open-Screen.jpg](https://i.postimg.cc/ZKkwX0Dy/open-Screen.jpg)](https://postimg.cc/K4N7McbZ)
•	Learn – upload normal file to designated box, the server will learn from this file.

•	Detect – upload file which the client want to investigate to designated box, the server will detect anomalies and return it back to client.

•	Graphs – after uploading the anomaly file, by looking the the graphs we can see the data of our anomalies file represent by graph, and the anomalies wich marked with red dots.
We can select any feature from the feature list.

•	Table – after uploading the anomaly file, by looking at the table we can see the data of our anomalies file.

__Project Structure:__

[![folders.png](https://i.postimg.cc/sD0tB3nj/folders.png)](https://postimg.cc/KRB9whSw)

1)	AnomalyDetectorByOs –
contains native code of anomaly detector for windows ,linux and mac.
2)	controller – 
responsible of the server logic (server response logic).
This folder contains the server code. 
3)	Model –
the main and only model of the project, implements the ( ) design pattern and it's responsible of the business logic of the project.
Contains the logic parts of the application such as detect anomalies by Contact the anomaly detector, parse the result from the anomaly detector and so on.
4)	view – 
This folder contains the view logic and it's implementation.

__Installation requirements:__

node.js can be download from [here](https://nodejs.org/en/)

windows/linux/mac operation system

__Installation Instructions:__

1) download the files from git.
2) open terminal/cmd and enter to the controller directory (the working directory shuld be controller folder).
3) write in terminal/cmd __node controller.js__ and press enter.
4) now the server is up.

__run the client instruction:__

__if (you want to run the client from the same computer as the server)__ 

 {
 
 open the browser and enter the uml: __127.0.0.1:9876__ 
 
 }
 __else__ {
 
  open the browser and enter the uml: __SERVER_IP:9876__ , while the __SERVER_IP__ is the ip of the server.
  
 }

__UML:__

[![umlNew.png](https://i.postimg.cc/XvnfF9Bb/umlNew.png)](https://postimg.cc/k2hRP6y1)

Furthermore, you can find [here](https://github.com/gavrielSorek/advenceProgrammingMilestone2/tree/main/documentation) more information regarding the project and it's files.
