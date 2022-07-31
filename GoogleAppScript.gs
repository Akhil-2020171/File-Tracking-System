var ss = SpreadsheetApp.openById('Google_Sheet_ID');
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
  var ID = stripQuotes(e.parameters.id);

  var index = onSearch(ID);
  //----------------------------------------------------------------------------------
  if(index==-1){
    var nextRow = sheet.getLastRow() + 2;
    sheet.getRange("A" + nextRow).setValue(ID);
    sheet.getRange("B" + nextRow).setValue(Deploy_Date);
    sheet.getRange("C" + nextRow).setValue(Deploy_Time);
    sheet.getRange("D" + nextRow).setValue(Reader_name);
  
  //----------------------------------------------------------------------------------
    return ContentService.createTextOutput("Reader name is stored in column B C D");
  //----------------------------------------------------------------------------------
  
  }
  else if(index!=-1){
    var val = sheet.getRange(index+2,6,10,1).getValues()[0];
    var ct = index;
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

function onSearch(id){
    var searchString = id.toString();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1"); 
    var column = 1; //column Index   
    var columnValues = sheet.getRange(2, column, sheet.getLastRow()).getValues(); //1st is header row
    var searchResult = columnValues.findIndex(searchString); //Row Index - 2

    if(searchResult != -1){
        //searchResult + 2 is row index.
        sheet.setActiveRange(sheet.getRange(searchResult + 2, 1))
    }

    return searchResult;
}

Array.prototype.findIndex = function(search){
  if(search == "") return false;
  for (var i=0; i<this.length; i++)
    if (this[i] == search) return i;

  return -1;
}
