#include <SPI.h>
#include <MFRC522.h>
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <WiFiClientSecureBearSSL.h>

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

#define OLED_RESET     -1 // Reset pin # (or -1 if sharing Arduino reset pin)
#define SCREEN_ADDRESS 0x3C ///< See datasheet for Address; 0x3D for 128x64, 0x3C for 128x32
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

//-----------------------------------------
constexpr uint8_t RST_PIN = D3;
constexpr uint8_t SS_PIN = D4;
//constexpr uint8_t BUZZER = D2;
//-----------------------------------------
MFRC522 mfrc522(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key key;  
MFRC522::StatusCode status;      
//-----------------------------------------
/* Set the block to write data */
int blockNum = 2;  
/* This is the actual data which is going to be written into the card */
byte blockData [16] = {"ECE"};
//-----------------------------------------
/* Create array to read data from Block */
/* Length of buffer should be 2 Bytes more than the size of Block */
byte bufferLen = 18;
byte readBlockData[18];
//-----------------------------------------
//-----------------------------------------
String card_holder_name;
String card_uid;
const String sheet_url = "script url + ?";
//-----------------------------------------
const uint8_t fingerprint[20] = {0xc2,0x29,0xb0,0x5e,0xf8,0x50,0x51,0x3c,0x3e,0x18,0x38,0xc4,0x87,0x9f,0xdd,0xde,0x5b,0xc4,0x00,0x77};
//-----------------------------------------
//-----------------------------------------
#define WIFI_SSID "realme"
#define WIFI_PASSWORD "1234@1234"
//-----------------------------------------

void setup(){
  //-----------------------------------------
  //Initialize serial communications with PC
  Serial.begin(9600);
  //-----------------------------------------
  //Initialize SPI bus
  SPI.begin();
  //--------------------------------------------------
  //WiFi Connectivity
  Serial.println();
  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(200);
  }
  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Node MCU board MAC-Address : ");
  Serial.println(WiFi.macAddress());
  Serial.println();
  //--------------------------------------------------
  
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;);
  }
}

void loop(){ 
  //Initialize MFRC522 Module
  mfrc522.PCD_Init();
  
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(0, 10);
  display.println("Scan");
  display.display();
  
  setup1();
  setup2();
}

// Reader Code //
void setup1(){
  /* Prepare the ksy for authentication */
  /* All keys are set to FFFFFFFFFFFFh at chip delivery from the factory */
  for (byte i = 0; i < 6; i++){
    key.keyByte[i] = 0xFF;
  }
  /* Look for new cards */
  /* Reset the loop if no new card is present on RC522 Reader */
  if ( ! mfrc522.PICC_IsNewCardPresent()) {return;}
  /* Select one of the cards */
  if ( ! mfrc522.PICC_ReadCardSerial()) {return;}

  //------------------------------------------------------------------------------
  Serial.println("Scan a MIFARE 1K Tag to Detect data...");
  //------------------------------------------------------------------------------
  Serial.print("\n");
  Serial.println("**Card Detected**");
  /* Print UID of the Card */
  Serial.print(F("Card UID:"));
  
  for (byte i = 0; i < mfrc522.uid.size; i++){
    Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
    Serial.print(mfrc522.uid.uidByte[i], HEX);
  }
  
  char str[32] = "";
  array_to_string(mfrc522.uid.uidByte, 4, str); //Insert (byte array, length, char array for output)
  card_uid = str; 

  Serial.print("\n");
  /* Print type of card (for example, MIFARE 1K) */
  Serial.print(F("PICC type: "));
  MFRC522::PICC_Type piccType = mfrc522.PICC_GetType(mfrc522.uid.sak);
  Serial.println(mfrc522.PICC_GetTypeName(piccType));
  //------------------------------------------------------------------------------
   /* Call 'WriteDataToBlock' function, which will write data to the block */
   Serial.print("\n");
   Serial.println("Writing to Data Block...");
   WriteDataToBlock(blockNum, blockData);
   //------------------------------------------------------------------------------
   Serial.print("\n");
   //------------------------------------------------------------------------------
  
  display.clearDisplay();
  display.setTextSize(1.5);
  display.setTextColor(WHITE);
  display.setCursor(0, 10);
  display.println("Data has been written inside the Tag.");
  display.display();
  delay(500);
  display.clearDisplay();
}

// Writer Code in Google Sheets//
 void setup2(){
  //Initialize MFRC522 Module
  mfrc522.PCD_Init();
  /* Look for new cards */
  /* Reset the loop if no new card is present on RC522 Reader */
  if ( ! mfrc522.PICC_IsNewCardPresent()) {return;}
  /* Select one of the cards */
  if ( ! mfrc522.PICC_ReadCardSerial()) {return;}
  /* Read data from the same block */
  //--------------------------------------------------
  Serial.println();
  Serial.println(F("Reading last data from RFID..."));
  ReadDataFromBlock(blockNum, readBlockData);
  /* If you want to print the full memory dump, uncomment the next line */
  //mfrc522.PICC_DumpToSerial(&(mfrc522.uid));
  
  /* Print the data read from block */
  Serial.println();
  Serial.print(F("Last data in RFID:"));
  Serial.print(blockNum);
  Serial.print(F(" --> "));
  
  for (int j=0 ; j<16 ; j++){
    Serial.write(readBlockData[j]);
  }
  Serial.println();  
  if (WiFi.status() == WL_CONNECTED) {
    //-------------------------------------------------------------------------------
    std::unique_ptr<BearSSL::WiFiClientSecure>client(new BearSSL::WiFiClientSecure);
    //-------------------------------------------------------------------------------
    client->setFingerprint(fingerprint);
    //-----------------------------------------------------------------
    card_holder_name = sheet_url +"id=" + card_uid +"&name="+String((char*)readBlockData);
    card_holder_name.trim();
    Serial.println(card_holder_name);
    //-----------------------------------------------------------------
    HTTPClient https;
    Serial.print(F("[HTTPS] begin...\n"));
    //-----------------------------------------------------------------

    if (https.begin(*client,card_holder_name)){
      //-----------------------------------------------------------------
      // HTTP
      Serial.print(F("[HTTPS] GET...\n"));
      // start connection and send HTTP header
      int httpCode = https.GET();
      //-----------------------------------------------------------------
      // httpCode will be negative on error
      if (httpCode > 0) {
        // HTTP header has been send and Server response header has been handled
        Serial.printf("[HTTPS] GET... code: %d\n", httpCode);
        // file found at server
        display.clearDisplay();
        display.setTextSize(1.5);
        display.setTextColor(WHITE);
        display.setCursor(0, 10);
        display.println("Data has been written in the Google Sheet.");
        display.display();
        delay(1000);
        display.clearDisplay();
      }
      //-----------------------------------------------------------------
      else {
        Serial.printf("[HTTPS] GET... failed, error: %s\n", https.errorToString(httpCode).c_str());
        display.clearDisplay();
        display.setTextSize(1.5);
        display.setTextColor(WHITE);
        display.setCursor(0, 10);
        display.println("Data hasn't been written in the Google Sheet.");
        display.display();
        delay(1000);
        display.clearDisplay();
      }
      //-----------------------------------------------------------------
      https.end();
      delay(1000);
    }
    else {
      Serial.printf("[HTTPS} Unable to connect\n");
    }
  }
}
/****************************************************************************************************
 * ReadDataFromBlock() function
 ****************************************************************************************************/
void ReadDataFromBlock(int blockNum, byte Data[]) { 
  //----------------------------------------------------------------------------
  /* Prepare the ksy for authentication */
  /* All keys are set to FFFFFFFFFFFFh at chip delivery from the factory */
  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }
  //----------------------------------------------------------------------------
  /* Authenticating the desired data block for Read access using Key A */
  status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, blockNum, &key, &(mfrc522.uid));
  //----------------------------------------------------------------------------s
  if (status != MFRC522::STATUS_OK){
     Serial.print("Authentication failed for Read: ");
     Serial.println(mfrc522.GetStatusCodeName(status));
     return;
  }
  //----------------------------------------------------------------------------
  else {
    Serial.println("Authentication success");
  }
  //----------------------------------------------------------------------------
  /* Reading data from the Block */
  status = mfrc522.MIFARE_Read(blockNum, Data, &bufferLen);
  if (status != MFRC522::STATUS_OK) {
    Serial.print("Reading failed: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
    return;
  }
  //----------------------------------------------------------------------------
  else {
    Serial.println("Block was read successfully");  
  }
  //----------------------------------------------------------------------------
}

/****************************************************************************************************
 * Writ() function
 ****************************************************************************************************/
void WriteDataToBlock(int blockNum, byte Data[]) {
  //------------------------------------------------------------------------------
  /* Authenticating the desired data block for write access using Key A */
  status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, blockNum, &key, &(mfrc522.uid));
  if (status != MFRC522::STATUS_OK){
    Serial.print("Authentication failed for Write: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
    return;
  }
  //------------------------------------------------------------------------------
  else {
    Serial.println("Authentication success");
  }
  //------------------------------------------------------------------------------
  /* Write data to the block */
  status = mfrc522.MIFARE_Write(blockNum, Data ,16);
  if (status != MFRC522::STATUS_OK) {
    Serial.print("Writing to Block failed: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
    return;
  }
  else
  {Serial.println("Data was written into Block successfully");}
  //------------------------------------------------------------------------------
}

void array_to_string(byte array[], unsigned int len, char buffer[]){
   for (unsigned int i = 0; i < len; i++)
   {
      byte nib1 = (array[i] >> 4) & 0x0F;
      byte nib2 = (array[i] >> 0) & 0x0F;
      buffer[i*2+0] = nib1  < 0xA ? '0' + nib1  : 'A' + nib1  - 0xA;
      buffer[i*2+1] = nib2  < 0xA ? '0' + nib2  : 'A' + nib2  - 0xA;
   }
   buffer[len*2] = '\0';
}
