var ss = SpreadsheetApp.openById('1D7anoT2c3DBEl1dOeI2XKChWsCiR6rV04ZIZS5nq2uw');
var sheet = ss.getActiveSheet();
var timezone = Session.getScriptTimeZone();
Logger.log(timezone);

function doGet(e){
  Logger.log( JSON.stringify(e) );
  
  //get gps data from ESP32
  if (e.parameter == 'undefined') {
    return ContentService.createTextOutput("Deployed data is undefined");
  }

  //----------------------------------------------------------------------------------
  var Deploy_Date = new Date();
  var Deploy_Time = Utilities.formatDate(Deploy_Date, timezone, 'HH:mm:ss');
  var Reader_name = stripQuotes(e.parameters.name);
  var ID = stripQuotes(e.parameters.id).toString();

  var vaules = sheet.getRange("A2:A").getValues()[0];
  var index = -1;
  for(var i = 0; i<vaules.length ; i++){
    if(vaules[i].toString().match(ID)){
      index = i;
      break;
    }
  }
  
  //----------------------------------------------------------------------------------
  if(index==-1){
    var nextRow = sheet.getLastRow() + 1;
    sheet.getRange("A" + nextRow).setValue(ID);
    sheet.getRange("B" + nextRow).setValue(Deploy_Date);
    sheet.getRange("C" + nextRow).setValue(Deploy_Time);
    sheet.getRange("D" + nextRow).setValue(Reader_name);
  
  //----------------------------------------------------------------------------------
    
    return ContentService.createTextOutput("Reader name is stored in column B C D");
  
  //----------------------------------------------------------------------------------
  
  }
  else if(index!=-1){
    var val = sheet.getRange(index+1,6,10,3).getValues()[0];
    var ct = 1;
    while ( val[ct] != "" ) {ct++;}

  //----------------------------------------------------------------------------------
    var Receiving_Date = new Date();
    var Receiving_Time = Utilities.formatDate(Receiving_Date, timezone, 'HH:mm:ss');
    var Receiving_Dept = stripQuotes(e.parameters.name);
    
  //----------------------------------------------------------------------------------
    sheet.getRange("E"+ct).setValue(index);
    sheet.getRange("F"+ct).setValue(Receiving_Date);
    sheet.getRange("G"+ct).setValue(Receiving_Time);
    sheet.getRange("H"+ct).setValue(Receiving_Dept);
    sheet.insertRowAfter(sheet.getLastRow());
  //----------------------------------------------------------------------------------

    return ContentService.createTextOutput("Receiving Data is stored in column F G H");
  //---------------------------------------------------------------------------------- 
  }

}

function stripQuotes( value ) {
  return value.toString().replace(/^["']|['"]$/g, "");
}

// function doPost(e) {
//   var val = e.parameter.value;
  
//   if (e.parameter.value !== undefined){
//     var range = sheet.getRange('A2');
//     range.setValue(val);
//   }
// }