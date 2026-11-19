/**
 * Basic analytics receiver for the Stoki Poa page.
 *
 * Setup (about 5 minutes):
 * 1. Create a new Google Sheet. Name the first tab:  Events
 *    Put these headers in row 1:  time | event
 * 2. In the Sheet: Extensions > Apps Script. Delete the sample code and paste this file.
 * 3. Deploy > New deployment > type "Web app".
 *    Execute as: Me.  Who has access: Anyone.  Copy the web app URL.
 * 4. Paste that URL into CONFIG.analyticsUrl in app.js.
 *
 * Events recorded: view, call_click, whatsapp_click, send_quote, delivery, install,
 * and add:<item id> (shows which items customers add most).
 * No names, phone numbers, IP addresses or cookies are stored.
 */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Events");
  var ev = "unknown";
  try {
    ev = String(JSON.parse(e.postData.contents).e).substring(0, 60);
  } catch (err) {}
  sheet.appendRow([new Date(), ev]);
  return ContentService.createTextOutput("ok");
}

/* Optional: run this from the editor to see counts per event in the log. */
function summary() {
  var rows = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Events").getDataRange().getValues();
  var counts = {};
  for (var i = 1; i < rows.length; i++) counts[rows[i][1]] = (counts[rows[i][1]] || 0) + 1;
  Logger.log(JSON.stringify(counts, null, 2));
}
