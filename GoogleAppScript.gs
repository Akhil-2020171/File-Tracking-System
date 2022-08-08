var ss = SpreadsheetApp.openById('1D7anoT2c3DBEl1dOeI2XKChWsCiR6rV04ZIZS5nq2uw');
var sheet = ss.getActiveSheet();
var timezone = Session.getScriptTimeZone();

function doGet(e){

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
    var value = sheet.getRange("F"+index);
    if(!value.isBlank()){
      var tempIndex = index+1;
      sheet.insertRowAfter(index);
      sheet.getRange("F"+index + ":" + "I"+index).copyValuesToRange(sheet.getRange("F"+index + ":" + "I"+index).getGridId(),6,10,tempIndex,tempIndex);
      sheet.getRange("F"+index + ":" + "I"+index).clearContent();
    }

  //----------------------------------------------------------------------------------
    var Receiving_Date = new Date();
    var Receiving_Time = Utilities.formatDate(Receiving_Date, timezone, 'HH:mm:ss');
    var Receiving_Dept = stripQuotes(e.parameters.name);
    var T1 = sheet.getRange("C" + index).getValue();
    var T2 = sheet.getRange("G" + index).getValue();
    var Holding_Time = T2-T1;
  //----------------------------------------------------------------------------------

    sheet.getRange("F" + index).setValue(Receiving_Date);
    sheet.getRange("G" + index).setValue(Receiving_Time);
    sheet.getRange("H" + index).setValue(Receiving_Dept);
    sheet.getRange("I" + index).setValue(Holding_Time);

  //----------------------------------------------------------------------------------
    return ContentService.createTextOutput("Receiving Data is stored in column F G H I");
  //---------------------------------------------------------------------------------- 
  }
}

function stripQuotes( value ) {
  return value.toString().replace(/^["']|['"]$/g, "");
}

function onSearch(id){
    var searchString = id.toString();
    var Sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1"); 
    var column = 1; //column Index   
    var columnValues = Sheet.getRange(2, column, Sheet.getLastRow()).getValues(); //1st is header row
    var searchResult = columnValues.findIndex(searchString); //Row Index - 2

    if(searchResult != -1){
        //searchResult + 2 is row index.
        //Sheet.setActiveRange(Sheet.getRange(searchResult + 2, 1))
        return searchResult + 2;
    }

    return searchResult;
}

Array.prototype.findIndex = function(search){
  if(search == "") return false;
  for (var i=0; i<this.length; i++)
    if (this[i] == search) return i;

  return -1;
}
