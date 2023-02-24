#include <HTTPSRedirect.h>
#include <ESP8266mDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128    // OLED display width, in pixels
#define SCREEN_HEIGHT 64    // OLED display height, in pixels
#define OLED_RESET     -1   // Reset pin # (or -1 if sharing Arduino reset pin)
#define SCREEN_ADDRESS 0x3C // See datasheet for Address; 0x3D for 128x64, 0x3C for 128x32
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
//-----------------------------------------
constexpr uint8_t RST_PIN = D3;
constexpr uint8_t SS_PIN = D4;
constexpr uint8_t BUZZER = D8;
constexpr uint8_t LED = D0; 

//-----------------------------------------
MFRC522 mfrc522(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key key;  
MFRC522::StatusCode status;      
//-----------------------------------------
/* This is the actual data which is going to be written into the card */
const String blockData = "AdminSP";
//const String blockData = "AdminFA";
String card_uid;          
//-----------------------------------------
#define WIFI_SSID "FACULTY-STAFF-N"
#define WIFI_PASSWORD "I@netsec"

// Google Sheets setup (do not edit)
const char* HOST = "script.google.com";
const int httpsPort = 443;
String sheet_url = "/macros/s/AKfycby3ZPtmwHeU6SdLjsDpj-ofBVB4ihNQ_R1WuFSoI_FAUoDPbXuiTAHJuBaCGjaPpbFg/exec";
HTTPSRedirect* client = nullptr;
String payload_base =  "{\"values\": ";
String payload = "";

void setup(){
  //-----------------------------------------
  //Initialize serial communications with PC
  Serial.begin(9600);
  //-----------------------------------------
  //Initialize SPI bus
  SPI.begin();
  //--------------------------------------------------
  /* Set BUZZER and LED as OUTPUT */
  pinMode(BUZZER, OUTPUT);
  pinMode(LED,OUTPUT);

  delay(500);
  //--------------------------------------------------
  
  //WiFi Connectivity
  Serial.println("Booting");
  Serial.print("Connecting to Wi-Fi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.waitForConnectResult() != WL_CONNECTED) {
    Serial.println("Connection Failed! Rebooting...");
    delay(5000);
    ESP.restart();
  }
  Serial.println('\n');  
    
  ArduinoOTA.onStart([]() {
    Serial.println("Start");
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\nEnd");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("End Failed");
  });
  
  ArduinoOTA.begin();
  Serial.println("Ready");
  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Node MCU board MAC-Address : ");
  Serial.println(WiFi.macAddress());
  Serial.println();
  //--------------------------------------------------
  // Use HTTPSRedirect class to create a new TLS connection
  client = new HTTPSRedirect(httpsPort);
  client->setInsecure();
  client->setPrintResponseBody(true);
  client->setContentTypeHeader("application/json");
  // Try to connect for a maximum of 5 times
  bool flag = false;
  for (int i=0; i<5; i++){ 
    int retval = client->connect(HOST, httpsPort);
    if (retval == 1){
       flag = true;
       Serial.println("Connected");
       break;
    }
    else
      Serial.println("Connection failed. Retrying...");
  }
  if (!flag){
    Serial.print("Could not connect to server: ");
    Serial.println(HOST);
    return;
  }  
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(HOST);

  delete client;    // delete HTTPSRedirect object
  client = nullptr; // delete HTTPSRedirect object
  
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;);
  }
  //-------------------------------------------------
  Serial.println("Scan a MIFARE 1K Tag to Detect data...");
  delay(500);
}

void loop(){   
  ArduinoOTA.handle();
   
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(0, 10);
  display.println("Scan");
  display.display();
   
  setup2(); 
}

// Writer Code in Google Sheets//
 void setup2(){
  //Initialize MFRC522 Module
  mfrc522.PCD_Init();
  /* Prepare the ksy for authentication */
  /* All keys are set to FFFFFFFFFFFFh at chip delivery from the factory */
  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }
  /* Look for new cards */
  /* Reset the loop if no new card is present on RC522 Reader */
  if ( ! mfrc522.PICC_IsNewCardPresent()) {return;}
  /* Select one of the cards */
  if ( ! mfrc522.PICC_ReadCardSerial()) {return;}
  //------------------------------------------------------------------------------
  //------------------------------------------------------------------------------
  Serial.print("\n");
  Serial.println("**Card Detected**");
  digitalWrite(LED,HIGH);
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
  //--------------------------------------------------
  Serial.println();  

  static bool flag = false;
  if (!flag){
    client = new HTTPSRedirect(httpsPort);
    client->setInsecure();
    flag = true;
    client->setPrintResponseBody(true);
    client->setContentTypeHeader("application/json");
  }
  if (client != nullptr){
    if (!client->connected()){
      client->connect(HOST, httpsPort);
    }
  }
  else{
    Serial.println("Error creating client object!");
  }

  // Create json object string to send to Google Sheets
  payload = payload_base + "\"" + card_uid + "," + blockData + "\"}";
  
  // Publish data to Google Sheets
  Serial.println("Publishing data...");
  Serial.println(payload);
  if(client->POST(sheet_url, HOST, payload)){ 
    digitalWrite(LED,LOW);
    digitalWrite(BUZZER, HIGH);
    delay(1000);
    Serial.println("Successful Connection : Data has been transferred to Google Sheets.");
    display.clearDisplay();
    display.setTextSize(2);
    display.setTextColor(WHITE);
    display.setCursor(0, 10);
    display.println("DONE");
    display.display();
    delay(500);
    display.println(card_uid);
    display.display();
    digitalWrite(BUZZER, LOW);
    display.clearDisplay();
    delay(1000);
  }
  else{
    Serial.println("Error while connecting");
    display.clearDisplay();
    display.setTextSize(1.5);
    display.setTextColor(WHITE);
    display.setCursor(0, 10);
    display.println("Error while connecting");
    display.display();
    delay(1000);
    display.clearDisplay();
  }

  // a delay of several seconds is required before publishing again    
  delay(1000);
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
