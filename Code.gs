/**
 * Serves the appropriate HTML file based on the URL parameter.
 * @param {object} e The event parameter for the GET request.
 */
function doGet(e) {
  const page = (e && e.parameter && e.parameter.page) ? e.parameter.page : '';

  if (page === 'staff') {
    return HtmlService.createHtmlOutputFromFile('Staff')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  }

  if (page === 'auth') {
    return HtmlService.createHtmlOutputFromFile('Auth')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  }

  // Default to index.html for all other cases
  return HtmlService.createHtmlOutputFromFile('index')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}


/**
 * Validates staff login credentials.
 * NOTE: This is a simple validation.
 */
function checkLogin(username, password) {
  const STAFF_USERNAME = 'admin'; // เปลี่ยนชื่อผู้ใช้
  const STAFF_PASSWORD = 'password'; // เปลี่ยนรหัสผ่าน

  if (username === STAFF_USERNAME && password === STAFF_PASSWORD) {
    return true;
  }
  return false;
}

/**
 * Processes the donation form and uploaded file. (Used by both public and staff)
 */
function processForm(formData) {
  const spreadsheetId = '1C0_mjJYPkt3ckuvb_WrkfHOP9PdWXRtuHJQ8WcDROoQ';
  const sheetName = 'Sheet1';
  const folderId = '1ZboreKEPlJ4ZC-51Tm3M0yL7gxK5zX-s';

  try {
    const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
    if (!sheet) {
      throw new Error("Sheet '" + sheetName + "' not found.");
    }

    let fileUrl = '';
    if (formData.fileBlob && formData.fileBlob.length > 0) {
      const fileBlob = Utilities.newBlob(Utilities.base64Decode(formData.fileBlob), formData.fileType, formData.fileName);
      const folder = DriveApp.getFolderById(folderId);
      const file = folder.createFile(fileBlob);
      fileUrl = file.getUrl();
    }

    const rowData = [
      new Date(),
      formData.donation_purpose,
      formData.name,
      formData.amount,
      formData.channel,
      formData.note,
      formData.receipt_option,
      fileUrl
    ];

    sheet.appendRow(rowData);
    return { success: true };

  } catch (e) {
    Logger.log('Error processing form: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Retrieves all donation data from Google Sheet.
 */
function getDonationData() {
  const spreadsheetId = '1C0_mjJYPkt3ckuvb_WrkfHOP9PdWXRtuHJQ8WcDROoQ';
  const sheetName = 'Sheet1';
  
  try {
    const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    return values;
  } catch (e) {
    Logger.log('Error fetching data: ' + e.message);
    return [];
  }
}

/**
 * Deletes a record from the Google Sheet by row number.
 */
function deleteDonationRecord(rowNumber) {
  const spreadsheetId = '1C0_mjJYPkt3ckuvb_WrkfHOP9PdWXRtuHJQ8WcDROoQ';
  const sheetName = 'Sheet1';
  
  try {
    const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
    sheet.deleteRow(rowNumber);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
