# File-Tracking-System

Components Requirement : NodeMCU (ESP8266MOD) , RFID-RC522 , RFID tags, Jumper wires.

Below is the Circuit Diagram (Buzzer is not compulsory):
  ![image](https://drive.google.com/uc?export=view&id=1uW2rYJLGlRNlYZ-IXklyP4lxCPuKpk8a)
  
# Arduino Code contains majorly two functions:
   1. Reader Function which reads the UID of a particular RFID tag and the data written inside that particular tag. If there is no data in the RFID tag then this   
      function will write required data as well.
   2. Writer Function which writes the details in Google SpreadSheet like its UID, Stored Data, Time and Date of accessing the tag.

# Google App Script works in the following way : 
   1. Whenever a new tag gets read, it will provide a new row for it and write the necessary details in that particular row.
   2. When the same UID gets read, It will provide a new column in that particular row which contains that UID and write the necessary details in that particular column.


# Mentioned Necessary Details :
   1. ID
   2. Deploy Time
   3. Deploy Date
   4. Deploying Department
   5. Receive Time
   6. Receive Date
   7. Receiving Department
   8. Holding Time of a particular Department
   9. Remarks
