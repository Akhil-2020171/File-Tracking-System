var ss = SpreadsheetApp.openById('Sheet ID');
var sheet = ss.getActiveSheet();
var timezone = Session.getScriptTimeZone();

function doGet(e){

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
    sheet.getRange("B" + nextRow).setValue(Reader_name);
    sheet.getRange("C" + nextRow).setValue(Deploy_Date);
    sheet.getRange("D" + nextRow).setValue(Deploy_Time);
    sheet.getRange("E" + nextRow).setValue(0);
  
  //----------------------------------------------------------------------------------
    return ContentService.createTextOutput("Reader name is stored in column B C D E");
  //----------------------------------------------------------------------------------
  
  }
  else if(index!=-1){
    var entry = +sheet.getRange("E" + index).getValue();
    sheet.getRange("E" + index).setValue(entry+1);

    var value = sheet.getRange("F"+index);

    if(!value.isBlank()){
      var tempIndex = index+1;
      sheet.insertRowAfter(index);
      sheet.getRange("F"+index+":"+"I"+index).copyValuesToRange(sheet.getRange("F"+index+":"+"I"+index).getGridId(),6,10,tempIndex,tempIndex);
      sheet.getRange("F"+index+":"+"I"+index).clearContent();
    }

  //----------------------------------------------------------------------------------
    var Receiving_Date = new Date();
    var Receiving_Time = Utilities.formatDate(Receiving_Date, timezone, 'HH:mm:ss');
    var Receiving_Dept = stripQuotes(e.parameters.name);

  //----------------------------------------------------------------------------------
    sheet.getRange("F" + index).setValue(Receiving_Dept);
    sheet.getRange("G" + index).setValue(Receiving_Date);
    sheet.getRange("H" + index).setValue(Receiving_Time);

    var tempIndex = +index+1;
    if(sheet.getRange("H" + tempIndex).isBlank()) sheet.getRange("I" + index).setFormula('=(G' + index + '-' + 'C' + index + ')');
    else sheet.getRange("I" + index).setFormula('=(G' + index + '-' + 'G' + tempIndex + ')');

    var Dept1 = sheet.getRange("B"+index).getValue();
    var Dept2 = sheet.getRange("F"+index).getValue();

    if(Dept1 == Dept2){
      var lastIndex = +sheet.getRange("E"+index).getValue();
      sheet.getRange("A"+index).setValue(sheet.getRange("A"+index).getValue()+"/F");
      sheet.getRange(index,1,lastIndex,9).setBackground("#FF33F0");
    } 

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
