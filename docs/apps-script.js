/**
 * Google Apps Script — Pendaftaran JAGATRIP
 *
 * SETUP:
 * 1. Buka Google Sheets baru
 * 2. Extensions → Apps Script → paste seluruh code ini
 * 3. Jalankan fungsi setupSheet() SEKALI (Run → setupSheet)
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy URL deployment → paste di src/lib/form-handler.ts
 */

// ═══════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════

var SHEET_NAME = 'Pendaftaran';
var SUMMARY_NAME = 'Summary';
var HEADERS = [
  'No', 'Timestamp', 'Nama Lengkap', 'Email', 'WhatsApp',
  'Jabatan', 'Sekolah / Instansi', 'Kota Asal',
  'Kota Keberangkatan', 'Program', 'Jml Peserta',
  'Catatan', 'Status', 'Source'
];

var COL_WIDTHS = {
  1:40, 2:160, 3:180, 4:200, 5:140, 6:140, 7:200,
  8:150, 9:160, 10:200, 11:100, 12:200, 13:100, 14:250
};

// ═══════════════════════════════════════════════════════════════════════
// SETUP — Jalankan SEKALI
// ═══════════════════════════════════════════════════════════════════════

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.rename('JAGATRIP — Data Pendaftaran');

  // Get or create Pendaftaran sheet
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getActiveSheet();
    sheet.setName(SHEET_NAME);
  }

  // Clear & set headers
  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

  // Style header
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setBackground('#1F2937')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(10)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setRowHeight(1, 40);

  // Column widths
  for (var col in COL_WIDTHS) {
    sheet.setColumnWidth(parseInt(col), COL_WIDTHS[col]);
  }

  // Freeze header
  sheet.setFrozenRows(1);

  // Data area styling
  var dataRange = sheet.getRange(2, 1, 998, HEADERS.length);
  dataRange.setFontSize(10).setVerticalAlignment('middle').setWrap(true);

  // Zebra stripe
  var rule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=ISEVEN(ROW())')
    .setBackground('#F9FAFB')
    .setRanges([dataRange])
    .build();
  sheet.setConditionalFormatRules([rule]);

  // No column center
  sheet.getRange(2, 1, 998, 1).setHorizontalAlignment('center').setFontColor('#9CA3AF');

  // Timestamp format
  sheet.getRange(2, 2, 998, 1).setNumberFormat('dd/mm/yyyy hh:mm:ss').setFontColor('#6B7280').setFontSize(9);

  // Status column center + dropdown
  sheet.getRange(2, 13, 998, 1).setHorizontalAlignment('center');
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Baru', 'Dihubungi', 'Konfirmasi', 'DP', 'Lunas', 'Batal'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 13, 998, 1).setDataValidation(statusRule);

  // Filter (hapus dulu kalau ada)
  if (sheet.getFilter()) sheet.getFilter().remove();
  sheet.getRange(1, 1, 1, HEADERS.length).createFilter();

  // Create Summary sheet
  setupSummarySheet(ss);

  // Initial summary update
  updateSummary();

  SpreadsheetApp.flush();
  Logger.log('✅ Setup selesai!');
}

function setupSummarySheet(ss) {
  var summary = ss.getSheetByName(SUMMARY_NAME);
  if (!summary) {
    summary = ss.insertSheet(SUMMARY_NAME);
  }
  summary.clear();

  // Title
  summary.getRange('A1').setValue('JAGATRIP — Summary Pendaftaran').setFontSize(14).setFontWeight('bold').setFontColor('#1F2937');
  summary.getRange('A2').setValue('Auto-update setiap ada pendaftar baru').setFontSize(9).setFontColor('#9CA3AF');

  // Stats table header
  summary.getRange('A4').setValue('Metrik');
  summary.getRange('B4').setValue('Jumlah');
  summary.getRange(4, 1, 1, 2).setBackground('#1F2937').setFontColor('#FFFFFF').setFontWeight('bold');

  // Labels
  var labels = ['Total Pendaftar', 'Baru', 'Dihubungi', 'Konfirmasi', 'DP', 'Lunas', 'Batal'];
  labels.forEach(function(l, i) { summary.getRange(5 + i, 1).setValue(l); });

  // Program header
  summary.getRange('A14').setValue('Pendaftar per Program').setFontSize(11).setFontWeight('bold').setFontColor('#1F2937');
  summary.getRange('A15').setValue('Program');
  summary.getRange('B15').setValue('Jumlah');
  summary.getRange(15, 1, 1, 2).setBackground('#E8611F').setFontColor('#FFFFFF').setFontWeight('bold');

  // Styling
  summary.setColumnWidth(1, 200);
  summary.setColumnWidth(2, 120);
  summary.getRange(5, 2, 7, 1).setHorizontalAlignment('center').setFontWeight('bold').setFontSize(12);
  summary.getRange(16, 2, 10, 1).setHorizontalAlignment('center').setFontWeight('bold');
}

// ═══════════════════════════════════════════════════════════════════════
// UPDATE SUMMARY — dipanggil setiap doPost & bisa manual
// ═══════════════════════════════════════════════════════════════════════

function updateSummary() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  var summary = ss.getSheetByName(SUMMARY_NAME);
  if (!sheet || !summary) return;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    // No data yet
    summary.getRange(5, 2, 7, 1).setValue(0);
    return;
  }

  // Get all data
  var data = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();

  // Count status (kolom 13 = index 12)
  var statusCounts = { 'Baru': 0, 'Dihubungi': 0, 'Konfirmasi': 0, 'DP': 0, 'Lunas': 0, 'Batal': 0 };
  data.forEach(function(row) {
    var status = (row[12] || '').toString().trim();
    if (status in statusCounts) statusCounts[status]++;
  });

  // Write status counts
  summary.getRange(5, 2).setValue(data.length);
  summary.getRange(6, 2).setValue(statusCounts['Baru']);
  summary.getRange(7, 2).setValue(statusCounts['Dihubungi']);
  summary.getRange(8, 2).setValue(statusCounts['Konfirmasi']);
  summary.getRange(9, 2).setValue(statusCounts['DP']);
  summary.getRange(10, 2).setValue(statusCounts['Lunas']);
  summary.getRange(11, 2).setValue(statusCounts['Batal']);

  // Count programs (kolom 10 = index 9)
  var programCounts = {};
  data.forEach(function(row) {
    var prog = (row[9] || '').toString().trim();
    if (prog) programCounts[prog] = (programCounts[prog] || 0) + 1;
  });

  // Clear old program data
  summary.getRange(16, 1, 20, 2).clearContent();

  // Write programs
  var row = 16;
  for (var prog in programCounts) {
    summary.getRange(row, 1).setValue(prog);
    summary.getRange(row, 2).setValue(programCounts[prog]);
    row++;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.getActiveSheet();

    var data = JSON.parse(e.postData.contents);
    var lastRow = sheet.getLastRow();
    var no = lastRow <= 1 ? 1 : lastRow;

    sheet.appendRow([
      no,
      data.timestamp ? new Date(data.timestamp) : new Date(),
      data.nama || '',
      data.email || '',
      data.wa || '',
      data.jabatan || '',
      data.sekolah || '',
      data.kota_asal || '',
      data.kota_berangkat || '',
      data.program || '',
      data.peserta || '',
      data.catatan || '',
      'Baru',
      data.source || '',
    ]);

    // Update summary otomatis
    updateSummary();

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', row: no }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      service: 'JAGATRIP Registration API',
      sheet: SHEET_NAME,
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
