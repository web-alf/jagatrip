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
// ON EDIT TRIGGER — auto-update Summary saat edit manual di Pendaftaran
// ═══════════════════════════════════════════════════════════════════════

function onEdit(e) {
  if (!e) return;
  var sheetName = e.source.getActiveSheet().getName();
  if (sheetName === SHEET_NAME) {
    updateSummary();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// UPDATE SUMMARY — dipanggil oleh doPost, onEdit, dan bisa manual
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
// FILE UPLOAD HELPER — simpan base64 ke Google Drive
// ═══════════════════════════════════════════════════════════════════════

function saveFile(base64, fileName, mimeType) {
  if (!base64) return '';
  try {
    var folder = getDriveFolder();
    var blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, fileName);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    Logger.log('File upload error: ' + err);
    return 'UPLOAD_ERROR';
  }
}

function getDriveFolder() {
  var folderName = 'JAGATRIP_Registrasi_Files';
  var folders = DriveApp.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
}

// ═══════════════════════════════════════════════════════════════════════
// SETUP REGISTRASI SHEET — jalankan setupRegistrasiSheet() sekali
// ═══════════════════════════════════════════════════════════════════════

var REG_SHEET_NAME = 'Registrasi';
var REG_HEADERS = [
  'No', 'Timestamp', 'Nama Lengkap', 'Nama Panggilan', 'Alamat',
  'WhatsApp', 'Email', 'No Paspor', 'Expired Paspor',
  'File Paspor', 'File KTP',
  'Kota Asal', 'Bandara', 'Punya Tiket',
  'Ukuran Kaos', 'Teman Sekamar', 'Alergi/Penyakit',
  'Bukti Transfer', 'Status Bayar',
  'Instansi', 'Jabatan', 'Instagram', 'Motivasi',
  'Status', 'Source'
];

function setupRegistrasiSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(REG_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(REG_SHEET_NAME);

  sheet.clear();
  sheet.getRange(1, 1, 1, REG_HEADERS.length).setValues([REG_HEADERS]);
  sheet.getRange(1, 1, 1, REG_HEADERS.length)
    .setBackground('#0F172A')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(10)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setRowHeight(1, 40);
  sheet.setFrozenRows(1);

  // Column widths
  var widths = {1:40, 2:140, 3:180, 4:120, 5:200, 6:140, 7:180, 8:120, 9:120,
                10:100, 11:100, 12:120, 13:140, 14:100, 15:80, 16:150, 17:180,
                18:100, 19:100, 20:180, 21:120, 22:120, 23:250, 24:100, 25:200};
  for (var c in widths) sheet.setColumnWidth(parseInt(c), widths[c]);

  // Status dropdown
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Baru', 'Terverifikasi', 'Confirmed', 'Batal'], true)
    .setAllowInvalid(false).build();
  sheet.getRange(2, 24, 998, 1).setDataValidation(statusRule).setHorizontalAlignment('center');

  // Zebra
  var dataRange = sheet.getRange(2, 1, 998, REG_HEADERS.length);
  dataRange.setFontSize(10).setVerticalAlignment('middle').setWrap(true);
  var rule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=ISEVEN(ROW())')
    .setBackground('#F0F9FF')
    .setRanges([dataRange]).build();
  sheet.setConditionalFormatRules([rule]);

  if (sheet.getFilter()) sheet.getFilter().remove();
  sheet.getRange(1, 1, 1, REG_HEADERS.length).createFilter();

  Logger.log('✅ Sheet Registrasi siap!');
}

// ═══════════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var targetSheet = data._sheet || SHEET_NAME;

    // ── Route: Registrasi ──
    if (targetSheet === 'Registrasi') {
      return handleRegistrasi(ss, data);
    }

    // ── Route: Landing Page leads (LP1_Nonformal, LP2_Promo, LP_Jagatalk02, …) ──
    // Setiap _sheet berawalan "LP" diarahkan ke generic handler (auto-create sheet).
    if (targetSheet.indexOf('LP') === 0) {
      return handleGenericLead(ss, targetSheet, data);
    }

    // ── Route: Pendaftaran (default) ──
    return handlePendaftaran(ss, data);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handlePendaftaran(ss, data) {
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.getActiveSheet();

  var lastRow = sheet.getLastRow();
  var no = lastRow <= 1 ? 1 : lastRow;

  sheet.appendRow([
    no,
    data.timestamp ? new Date(data.timestamp) : new Date(),
    data.nama || '', data.email || '', data.wa || '',
    data.jabatan || '', data.sekolah || '', data.kota_asal || '',
    data.kota_berangkat || '', data.program || '', data.peserta || '',
    data.catatan || '', 'Baru', data.source || '',
  ]);

  updateSummary();

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', sheet: SHEET_NAME, row: no }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleRegistrasi(ss, data) {
  var sheet = ss.getSheetByName(REG_SHEET_NAME);
  if (!sheet) {
    setupRegistrasiSheet();
    sheet = ss.getSheetByName(REG_SHEET_NAME);
  }

  var lastRow = sheet.getLastRow();
  var no = lastRow <= 1 ? 1 : lastRow;

  // Upload files ke Drive
  var linkPaspor = saveFile(data.file_paspor, 'paspor_' + (data.nama_lengkap || no) + '_' + (data.file_paspor_name || 'file'), data.file_paspor_type || 'image/jpeg');
  var linkKtp = saveFile(data.file_ktp, 'ktp_' + (data.nama_lengkap || no) + '_' + (data.file_ktp_name || 'file'), data.file_ktp_type || 'image/jpeg');
  var linkBukti = saveFile(data.file_bukti_transfer, 'bukti_' + (data.nama_lengkap || no) + '_' + (data.file_bukti_transfer_name || 'file'), data.file_bukti_transfer_type || 'image/jpeg');

  sheet.appendRow([
    no,
    data.timestamp ? new Date(data.timestamp) : new Date(),
    data.nama_lengkap || '', data.nama_panggilan || '', data.alamat || '',
    data.wa || '', data.email || '',
    data.no_paspor || '', data.expired_paspor || '',
    linkPaspor, linkKtp,
    data.kota_asal || '', data.bandara || '', data.punya_tiket || '',
    data.ukuran_kaos || '', data.teman_sekamar || '', data.alergi || '',
    linkBukti, data.status_bayar || '',
    data.instansi || '', data.jabatan || '', data.instagram || '', data.motivasi || '',
    'Baru', data.source || '',
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', sheet: REG_SHEET_NAME, row: no }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ═══════════════════════════════════════════════════════════════════════
// GENERIC LEAD HANDLER — untuk LP forms (otomatis buat sheet jika belum ada)
// ═══════════════════════════════════════════════════════════════════════

function handleGenericLead(ss, sheetName, data) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var headers = ['No', 'Timestamp', 'Nama', 'WhatsApp', 'Email', 'Jabatan', 'Sekolah', 'Kota Asal', 'Catatan', 'Status', 'Source'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#0A1F44').setFontColor('#FFFFFF').setFontWeight('bold')
      .setFontSize(10).setHorizontalAlignment('center').setWrap(true);
    sheet.setFrozenRows(1);
    sheet.setRowHeight(1, 36);
  }

  var lastRow = sheet.getLastRow();
  var no = lastRow <= 1 ? 1 : lastRow;

  sheet.appendRow([
    no,
    data.timestamp ? new Date(data.timestamp) : new Date(),
    data.nama || '',
    data.wa || '',
    data.email || '',
    data.jabatan || '',
    data.sekolah || data.instansi || '',
    data.kota_asal || '',
    data.catatan || '',
    'Baru',
    data.source || '',
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', sheet: sheetName, row: no }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      service: 'JAGATRIP Registration API',
      sheets: [SHEET_NAME, REG_SHEET_NAME, 'LP1_Nonformal', 'LP2_Promo', 'LP_Jagatalk02'],
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
