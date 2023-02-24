var ss = SpreadsheetApp.openById('1Sh4X2OHtiQMyFYKY-SaKTny10IJK9kKY7zw_lAebd68');
var sheet = ss.getActiveSheet();
var timezone = Session.getScriptTimeZone();
var str = "";
var dict = {"AdminSP" : "akhil20171@iiitd.ac.in", "AdminFA" : "akhil20171@iiitd.ac.in"}

function onFormSubmit(){
  var required_sheet = ss.getSheetByName("Responses");
  Utilities.sleep(500);
  var nextRow    = required_sheet.getLastRow();
  var id         = required_sheet.getRange("B"+nextRow).getValue().toString();
  var extension  = required_sheet.getRange("C"+nextRow).getValue().toString();
  Utilities.sleep(500);

  var idx = onSearch(id);
  if(idx!=-1) sheet.getRange("K"+idx).setValue(extension);
}

// For Archiving

// function blurAndLockCells() {
//   var sheet = SpreadsheetApp.getActiveSheet();
//   var range = sheet.getRange("A1:B10"); // change range to desired cells
  
//   // blur cells
//   range.setBackgroundRGB(220, 220, 220);
  
//   // lock cells
//   range.setLocked(true);
  
//   // protect sheet
//   var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
//   if (protections.length == 0) {
//     sheet.protect().setDescription('Blurred and locked cells');
//   } else {
//     protections[0].setLocked(true);
//   }
// }

// function transferData() {
//   var ss1 = SpreadsheetApp.getActiveSpreadsheet();
//   var sheet1 = ss1.getSheetByName("Sheet1");
//   var data = sheet1.getRange("A1").getValue();
  
//   var ss2 = SpreadsheetApp.openById("ID_OF_SHEET2");
//   var sheet2 = ss2.getSheetByName("Sheet2");
//   sheet2.getRange("B2").setValue(data);
// }

function doGet(e){
  doPost(e);  
  return ContentService.createTextOutput(str);
}

function doPost(e){
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
    // Deployed Mail by reader //
    var subject_Reader = "File : "+ value1+" scanned";
    var range = "A"+index;
    var cell_link = 'https://docs.google.com/spreadsheets/d/1Sh4X2OHtiQMyFYKY-SaKTny10IJK9kKY7zw_lAebd68/view#gid=0&range='+range;
    var mail_body_Reader =  "Dear "+ value2 +" ,\n\nYour file has been scanned successfully. Click here ("+cell_link+ ") to see the updated details.\n\nThanks for using smart office.\nRegards,\nIIITD smart office team";

    MailApp.sendEmail(dict[value2],subject_Reader,mail_body_Reader);
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
        var lastIndex = +entry +1;
        sheet.getRange("E" + index).setFormula(entry+1);
        makeChanges(e,index,value2);

        var range = "A"+index+":"+"J"+lastIndex;
        var cell_link = 'https://docs.google.com/spreadsheets/d/1Sh4X2OHtiQMyFYKY-SaKTny10IJK9kKY7zw_lAebd68/view#gid=0&range='+range;

        var subject_Reader = "File : "+ value1+" scanned";
        var mail_body_Reader =  "Dear "+ value2 +" ,\n\nYour file has been scanned successfully. Click here (" +cell_link+ ") to see the updated details.\n\nThanks for using smart office.\nRegards,\nIIITD smart office team";
        MailApp.sendEmail(dict[value2],subject_Reader,mail_body_Reader);

        var subject_sender = "File : "+ value1 +" received by "+ value2 +" ";
        var mail_body_Sender  = "Dear "+ sheet.getRange("B"+index).getValue().toString() +" ,\n\nYour file( " + value1 + " ) has been received by "+ value2 +" . Click here (" +cell_link+ ") to see the updated details.\n\nThanks for using smart office.\nRegards,\nIIITD smart office team";
        MailApp.sendEmail(dict[sheet.getRange("B"+index).getValue()],subject_sender,mail_body_Sender);
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
        var lastIndex = +entry+1 ;
        sheet.getRange("E" + index).setFormula(entry+1);
      
        var tempIndex = index+1;
        sheet.insertRowAfter(index);
        sheet.getRange("F"+index+":"+"I"+index).copyValuesToRange(sheet.getRange("F"+index+":"+"I"+index).getGridId(),6,10,tempIndex,tempIndex);
        sheet.getRange("F"+index+":"+"I"+index).clearContent();
        makeChanges(e,index,value2);
    
        var range = "A"+index+":"+"J"+lastIndex;
        var cell_link = 'https://docs.google.com/spreadsheets/d/1Sh4X2OHtiQMyFYKY-SaKTny10IJK9kKY7zw_lAebd68/view#gid=0&range='+range;
        var form_link = 'https://forms.gle/xx55P9fUjQMfikin7';

        var subject_Reader = "File : "+ value1+" scanned";
        var mail_body_Reader =  "Dear "+ value2 +" ,\n\nYour file has been read scanned successfully. Click here (" +cell_link+ ") to see the updated  details.\n\nThanks for using smart office.\nRegards,\nIIITD smart office team";
        MailApp.sendEmail(dict[value2],subject_Reader,mail_body_Reader);

        var subject_sender = "File : "+ value1 +" received by "+ value2 +" ";
        var next_index = +index+1;

        var mail_body_Sender  = "Dear "+ sheet.getRange("F"+next_index).getValue().toString() +" ,\n\nYour file( " + value1 + " ) has been received by "+ value2 +" . Click here (" +cell_link+ ") to see the updated details.\n\nIf you wish to extend the deadline, please fill this form:\n\n"+form_link+"\n\nThanks for using smart office.\nRegards,\nIIITD smart office team";
      
        MailApp.sendEmail(dict[sheet.getRange("F"+next_index).getValue().toString()],subject_sender,mail_body_Sender);
      }
    }
  }
}

function makeChanges(e,index,value2){
//----------------------------------------------------------------------------------
  var Receiving_Date = new Date();
  var Receiving_Time = Utilities.formatDate(Receiving_Date, timezone, 'HH:mm:ss');
  var Receiving_Dept = value2; // e.parameters.name

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
  
  var lastIndex = +sheet.getRange("E"+index).getValue();
  if(Dept1 == Dept2){
    // var lastIndex = +sheet.getRange("E"+index).getValue();
    sheet.getRange("A"+index).setValue(sheet.getRange("A"+index).getValue()+"/F");
    sheet.getRange("J"+index).setValue("Finished");
    sheet.getRange(index,1,lastIndex,10).setBackground("#44cfbf");
  } 

  //----------------------------------------------------------------------------------
  str = "Receiving Data is stored in column F G H I J";
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
        // Logger.log(baseDate);
        if(baseDate>=2){
          // Remainder Mail //
          var index = +i;
          var lastIndex = +sheet.getRange("E"+index).getValue();
          var file_id = sheet.getRange("A"+index).getValue().toString();
          var range = "A"+index+":"+"J"+lastIndex;
          var cell_link = 'https://docs.google.com/spreadsheets/d/1Sh4X2OHtiQMyFYKY-SaKTny10IJK9kKY7zw_lAebd68/view#gid=0&range='+range;
          var form_link = 'https://forms.gle/xx55P9fUjQMfikin7';
          var sender = "";
          var receiver = "";

          var j = +i+1;
          if(sheet.getRange("F"+j).isBlank()){
            sender = sheet.getRange("A"+i).getValue().toString();
            receiver = sheet.getRange("F"+i).getValue().toString();
          }
          else{
            sender = sheet.getRange("F"+j).getValue().toString();
            receiver = sheet.getRange("F"+i).getValue().toString();
          }

          var subject = "Reminder:- Please process the pending file (" + file_id +" )";
          var body = "The file(" + file_id +") was submitted by "+ sender +" on the date-( "+sheet.getRange("G"+i).getValue()+" ) and has been in your department for the last * days( "+ baseDate+" ).   Click here ("+cell_link +") to see further details. If you wish to extend the deadline, please fill this form "+form_link+".\n\nThanks for using smart office.\nRegards,\nIIITD smart office team";

          MailApp.sendEmail(dict[receiver],subject,body);
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
    var Sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Regular"); 
    var column = 1; //column Index   
    var columnValues = Sheet.getRange(2, column, Sheet.getLastRow()).getValues(); //1st is header row
    var searchResult = columnValues.findIndex(searchString); //Row Index - 2

    if(searchResult != -1){
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
