# H-n-MI_team04

In the course H(n)MI (short for Human (non-Human) Machine Interaction), we learned about how to collect data about the body with an Arduino and then how to process and visualize this data using processing or p5.js.
***

## first day

To get ourselves into the right mood, we started by assembling a pressure sensor from a piece of velostat, 2 pieces of conductive tape and 2 pieces of fabric.

![Assembled Pressure Sensor](images/pressure-sensor-layers.gif)

We used a simple AnalogRead with the Arduino:


```
// Arduino code to read the pressure sensor
const int sensorPin = A0; // select the input pin for the sensor
int sensorValue = 0;      // variable to store the value coming from the sensor

void setup() {
  Serial.begin(9600); // initialize serial communication at 9600 bits per second
}

void loop() {
  sensorValue = analogRead(sensorPin); // read the value from the sensor
  Serial.println(sensorValue);         // print the sensor value to the serial monitor
  delay(100);                          // wait for 100 milliseconds
}
```

Then we connected the Arduino to Processing to use the value we get from the pressure sensor to affect a graphic display:

<div style="text-align: center;"> 

![Assembled Pressure Sensor](images/pressure-sensor-processing.gif)

 </div>



```
  import processing.serial.*;
  Serial mySerial;

  String myString;
  int nl=10;
  float myVal;

  void setup()
  {
    size(800, 600);
    printArray(Serial.list());
    delay(5000);
    String myPort = Serial.list()[8];
    mySerial = new Serial(this, myPort, 9600);
  }
  void draw(){
    while (mySerial.available() >0) {
      myString=mySerial.readStringUntil(nl);
      background(255, 0, 255);
      if (myString !=null) {

  myVal=float(myString);
        println(myVal);
        circle(width/2, height/2, myVal);
        smooth();
      }
    }
  }
```

***
## second day

On the second day, we started to experiment with p5.js.



***
## references

Many code snippets and detailed instructions can be found in our teachers' repository:
[https://github.com/TURBULENTE/H-n-MI](https://github.com/TURBULENTE/H-n-MI)

