# File-Tracking-System

## Components Requirement : 
  - NodeMCU (ESP8266MOD) 
  - RFID-RC522 
  - RFID tags
  - Jumper wires

## Circuit Diagram (Buzzer is not compulsory):
  ![image](https://drive.google.com/uc?export=view&id=1uW2rYJLGlRNlYZ-IXklyP4lxCPuKpk8a)
  
## Arduino Code contains majorly two functions:
   1. Reader Function which reads the UID of a particular RFID tag and the data written inside that particular tag. If there is no data in the RFID tag then this   
      function will write required data as well.
   2. Writer Function which writes the details in Google SpreadSheet like its UID, Stored Data, Time and Date of accessing the tag.

## Google App Script works in the following way : 
   1. Whenever a new tag gets read, it will provide a new row for it and write the necessary details in that particular row.
   2. When the same UID gets read, It will provide a new column in that particular row which contains that UID and write the necessary details in that particular column.


## Mentioned Necessary Details :
   1. ID
   2. Deploy Time
   3. Deploy Date
   4. Deploying Department
   5. Receive Time
   6. Receive Date
   7. Receiving Department
   8. Holding Time of a particular Department
   9. Status
   10. Transactions

## Advance Features: 
  - Over the Air (Updates)[https://randomnerdtutorials.com/esp8266-ota-updates-with-arduino-ide-over-the-air/]
  - Email Notification

## Google Sheet work Description 

  1) Layout
  
| ID of each RFID Tag | Deploying Department | Deploying Date | Deploying Time | Transactions | Receiving Department | Receiving Date | Receiving Time | Holding Time | Status |
|:-------------------:|:--------------------:|:--------------:|:--------------:|:------------:|:--------------------:|:--------------:|:--------------:|:-----------:|:------:|

  2) Working 

RFID-RC522 will read the tag as it comes at its proximity.  On its read , it will definitely read the unique ID of that tag and data stored in it. Every NodeMCU will store the Department name to its corresponding department setup location. 
If there is no entry of such UID in google sheet then it will add that particular UID in the deploying side of the google sheet because we are assuming if no particular UID is present in the google sheet that means it hasn’t been deployed by any department.
Second if a particular UID is already present then we add the reading details to its receiving side of the google sheet. And a particular remark for UID will decide if that UID can be reused again or not.

## Additional features 

Working on digital displays for every NodeMCU action (particular actions like reading data or writing data) and buzzers as well.
https://randomnerdtutorials.com/esp8266-0-96-inch-oled-display-with-arduino-ide/
