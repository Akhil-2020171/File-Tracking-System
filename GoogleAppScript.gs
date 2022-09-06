var ss = SpreadsheetApp.openById('1D7anoT2c3DBEl1dOeI2XKChWsCiR6rV04ZIZS5nq2uw');
var sheet = ss.getActiveSheet();
var timezone = Session.getScriptTimeZone();
var str = "";

function doGet(e){
  doPost(e);  
  return ContentService.createTextOutput(str);
}

function doPost(e){
  // Logger.log( JSON.stringify(e) );

  if (e.parameter == 'undefined') {
    return ContentService.createTextOutput("Deployed data is undefined");
  }

  var parsedData;
  
  try { 
    parsedData = JSON.parse(e.postData.contents);
  } 
  catch(f){
    return ContentService.createTextOutput("Error in parsing request body: " + f.message);
  }

  if (parsedData !== undefined){
    var flag = parsedData.format;
    if (flag === undefined){
      flag = 0;
    }
    var dataArr = parsedData.values.split(","); // creates an array of the values to publish 
    var value1 = dataArr [0]; // value0 from Arduino code, id
    var value2 = dataArr [1]; // value1 from Arduino code, name
  }
  //----------------------------------------------------------------------------------
    // var value1 = e.parameters.id; // value0 from Arduino code, id
    // var value2 = e.parameters.name; // value1 from Arduino code, name

  var Deploy_Date = new Date();
  var Deploy_Time = Utilities.formatDate(Deploy_Date, timezone, 'HH:mm:ss');
  var ID = stripQuotes(value1); // e.parameters.id
  var Reader_name = stripQuotes(value2); // e.parameters.name
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
    // Send Mail Notification for Successful Data Transmission //
    SpreadsheetApp.flush();
    str = "Reader name is stored in column A B C D";
    return ContentService.createTextOutput("Reader name is stored in column A B C D");
  //----------------------------------------------------------------------------------
  
  }
  else if(index!=-1){
    var value = sheet.getRange("F"+index);

    if(value.isBlank()){
      var prevData = sheet.getRange("B"+index).getValue();
      if(prevData == value2.toString()){
        str = "Receiving Data has already been stored";
        return ContentService.createTextOutput("Receiving Data has already been stored");
      }
      else{
        var entry = +sheet.getRange("E" + index).getValue();
        sheet.getRange("E" + index).setFormula(entry+1);
        makeChanges(e,index,value2);
      }
    }
    else{
      var Deptdata = value.getValue();
      if(Deptdata == value2.toString()){
        str = "Receiving Data has already been stored";
        return ContentService.createTextOutput("Receiving Data has already been stored");
      }
      else{
      var entry = +sheet.getRange("E" + index).getValue();
      sheet.getRange("E" + index).setFormula(entry+1);
      
      var tempIndex = index+1;
      sheet.insertRowAfter(index);
      sheet.getRange("F"+index+":"+"I"+index).copyValuesToRange(sheet.getRange("F"+index+":"+"I"+index).getGridId(),6,10,tempIndex,tempIndex);
      sheet.getRange("F"+index+":"+"I"+index).clearContent();
      makeChanges(e,index,value2);
      }
    }
  }
}

function makeChanges(e,index,value){
//----------------------------------------------------------------------------------
  var Receiving_Date = new Date();
  var Receiving_Time = Utilities.formatDate(Receiving_Date, timezone, 'HH:mm:ss');
  var Receiving_Dept = value; // e.parameters.name

//----------------------------------------------------------------------------------
  sheet.getRange("F" + index).setValue(Receiving_Dept);
  sheet.getRange("G" + index).setValue(Receiving_Date);
  sheet.getRange("H" + index).setValue(Receiving_Time);

  var tempIndex = +index+1;
  if(sheet.getRange("H" + tempIndex).isBlank()){
    sheet.getRange("I" + index).setFormula('=ArrayFormula(IFERROR(if(Len(A'+index+'),(int(G'+index+'-C'+index+')&"d "&text(G'+index+'-C'+index+'-int(G'+index+'-C'+index+'),"HH:MM:SS")),)))');
  }
  else{
    sheet.getRange("I" + index).setFormula('=ArrayFormula(IFERROR(if(Len(A'+index+'),(int(G'+index+'-G'+tempIndex+')&"d "&text(G'+index+'-G'+tempIndex+'-int(G'+index+'-G'+tempIndex+'),"HH:MM:SS")),)))');
  }

  var Dept1 = sheet.getRange("B"+index).getValue();
  var Dept2 = sheet.getRange("F"+index).getValue();

  if(Dept1 == Dept2){
    var lastIndex = +sheet.getRange("E"+index).getValue();
    sheet.getRange("A"+index).setValue(sheet.getRange("A"+index).getValue()+"/F");
    sheet.getRange("J"+index).setValue("Finished");
    sheet.getRange(index,1,lastIndex,10).setBackground("#44cfbf");
  } 

  //----------------------------------------------------------------------------------
  str = "Receiving Data is stored in column F G H I J";
  // Send Mail Notification for Successful Data Transmission //
  SpreadsheetApp.flush();
  return ContentService.createTextOutput("Receiving Data is stored in column F G H I J");
  //---------------------------------------------------------------------------------- 
}

function triggerOnEdit(){
  for(var i = 3; i<sheet.getLastRow(); i++){
    if(!sheet.getRange("A"+i).isBlank()){
      if(sheet.getRange("J"+i).getValue()=="Finished"){
        continue;
      }
      else{
        var baseDate = (new Date() - sheet.getRange("G"+i).getValue())/1000/60/60/24;
        baseDate = parseInt(baseDate);
        Logger.log(baseDate);
        if(baseDate>=3){
          // MailApp.sendEmail("sana@iiitd.ac.in","File Status","Holding Time is reached to its constraint.");
          // MailApp.sendEmail("khagendra@iiitd.ac.in","File Status","Holding Time is reached to its constraint.");
          // MailApp.sendEmail("akhil20171@iiitd.ac.in","File Status","Holding Time is reached to its constraint.");
          // MailApp.sendEmail("shashank20119@iiitd.ac.in","File Status","Holding Time is reached to its constraint.");
        }
      }
    }
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
        //Sheet.setRange(Sheet.getActiveRange(searchResult + 2, 1))
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
