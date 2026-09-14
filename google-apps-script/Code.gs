const CONFIG = {
  // Paste your Google Sheet ID here before deploying the script as a Web app.
  // Example: https://docs.google.com/spreadsheets/d/THIS_PART_IS_THE_ID/edit
  SPREADSHEET_ID: 'PASTE_GOOGLE_SHEET_ID_HERE',
  BOOKING_DAYS_AHEAD: 60,
  SLOT_INTERVAL_MINUTES: 30,
  TIMEZONE: 'Asia/Kolkata'
};

const SHEETS = {
  COUNSELLORS: 'Counsellors',
  AVAILABILITY: 'Availability',
  LEAVE: 'Leave',
  HOLIDAYS: 'Holidays',
  APPOINTMENT_TYPES: 'AppointmentTypes',
  APPOINTMENTS: 'Appointments'
};

function spreadsheet_() {
  if (CONFIG.SPREADSHEET_ID === 'PASTE_GOOGLE_SHEET_ID_HERE') {
    throw new Error('Set CONFIG.SPREADSHEET_ID in Code.gs first.');
  }
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function values_(sheetName) {
  const sheet = spreadsheet_().getSheetByName(sheetName);
  if (!sheet) throw new Error('Missing sheet: ' + sheetName);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1).filter(row => row.some(v => v !== '')).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function parseBool_(value, fallback) {
  if (value === '' || value === null || value === undefined) return fallback;
  return String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'yes' || value === true;
}

function dateKey_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, CONFIG.TIMEZONE, 'yyyy-MM-dd');
  return String(value).trim().slice(0, 10);
}

function timeKey_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, CONFIG.TIMEZONE, 'HH:mm');
  const s = String(value).trim();
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const parts = s.split(':').map(Number);
    return String(parts[0]).padStart(2, '0') + ':' + String(parts[1]).padStart(2, '0');
  }
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(s)) return s.slice(0, 5);
  return s;
}

function minutes_(hhmm) {
  const p = String(hhmm).split(':').map(Number);
  return p[0] * 60 + p[1];
}

function hhmm_(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

function dayIndex_(dateString) {
  const d = new Date(dateString + 'T12:00:00');
  return (d.getDay() + 6) % 7; // Monday=0 ... Sunday=6
}

function isoToday_() {
  return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
}

function addDays_(dateString, days) {
  const d = new Date(dateString + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return Utilities.formatDate(d, CONFIG.TIMEZONE, 'yyyy-MM-dd');
}

function overlaps_(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

function counsellors_() {
  return values_(SHEETS.COUNSELLORS).filter(r => parseBool_(r.active, true)).map(r => ({
    id: String(r.id), name: String(r.name), qualifications: String(r.qualifications || ''),
    specializations: String(r.specializations || ''), feePerHour: Number(r.feePerHour || 0),
    detailedInfo: String(r.detailedInfo || ''), photo: String(r.photo || ''), timezone: String(r.timezone || CONFIG.TIMEZONE)
  }));
}

function appointmentTypes_() {
  return values_(SHEETS.APPOINTMENT_TYPES).filter(r => parseBool_(r.active, true)).map(r => ({
    id: Number(r.id), name: String(r.name), duration_minutes: Number(r.duration_minutes || 60)
  }));
}

function isLeaveBlocked_(counsellorId, dateString, start, end, leaves) {
  return leaves.some(r => String(r.counsellor_id) === counsellorId && dateKey_(r.date) === dateString && (
    !r.start_time || !r.end_time || overlaps_(start, end, timeKey_(r.start_time), timeKey_(r.end_time))
  ));
}

function getSlots_(counsellorId, dateString, duration) {
  const today = isoToday_();
  if (dateString < today || dateString > addDays_(today, CONFIG.BOOKING_DAYS_AHEAD)) return [];
  const counsellor = counsellors_().find(c => c.id === counsellorId);
  if (!counsellor) return [];

  const holidays = values_(SHEETS.HOLIDAYS);
  if (holidays.some(r => dateKey_(r.date) === dateString)) return [];

  const weekday = dayIndex_(dateString);
  const schedules = values_(SHEETS.AVAILABILITY).filter(r =>
    String(r.counsellor_id) === counsellorId && Number(r.weekday) === weekday && parseBool_(r.active, true)
  ).sort((a, b) => minutes_(timeKey_(a.start_time)) - minutes_(timeKey_(b.start_time)));

  const leaves = values_(SHEETS.LEAVE);
  const appointments = values_(SHEETS.APPOINTMENTS).filter(r =>
    String(r.counsellor_id) === counsellorId && dateKey_(r.date) === dateString &&
    ['BOOKED', 'CONFIRMED'].indexOf(String(r.status || 'BOOKED').toUpperCase()) >= 0
  );

  const results = [];
  schedules.forEach(schedule => {
    const startWindow = minutes_(timeKey_(schedule.start_time));
    const endWindow = minutes_(timeKey_(schedule.end_time));
    for (let current = startWindow; current + duration <= endWindow; current += CONFIG.SLOT_INTERVAL_MINUTES) {
      const start = hhmm_(current);
      const end = hhmm_(current + duration);
      const blockedByLeave = isLeaveBlocked_(counsellorId, dateString, start, end, leaves);
      const blockedByBooking = appointments.some(a => overlaps_(start, end, timeKey_(a.start_time), timeKey_(a.end_time)));
      if (!blockedByLeave && !blockedByBooking) results.push({ start_time: start, end_time: end, available: true });
    }
  });
  return results;
}


function setupAntaraSheet() {
  const ss = spreadsheet_();
  const definitions = {
    Counsellors: [
      ['id','name','qualifications','specializations','feePerHour','detailedInfo','photo','active','timezone'],
      ['S001','Meenakshi Yellapragada','M.A. Clinical Psychology\nCertified Cognitive Behavioral Therapist','Anxiety Disorders\nDepression\nStress Management',450,'Meenakshi has over 8 years of experience in clinical psychology. She specializes in anxiety disorders and depression using evidence-based therapeutic approaches.','/staff-photos/Meenakshi.jpg',true,'Asia/Kolkata'],
      ['S002','Geeta','M.Sc. Counselling Psychology\nB.A. Psychology\nAccredited by BACP','Student Support\nCareer Counselling\nPersonal Development',450,'Geeta is an accredited counsellor with expertise in student support and career guidance.','/staff-photos/michael-chen.jpg',true,'Asia/Kolkata'],
      ['S003','Placeholder Staff 1','[To be filled]\n[Qualifications]','[To be filled]\n[Specialization]',0,'[Staff details to be added later]','/staff-photos/placeholder-1.jpg',true,'Asia/Kolkata'],
      ['S004','Placeholder Staff 2','[To be filled]\n[Qualifications]','[To be filled]\n[Specialization]',0,'[Staff details to be added later]','/staff-photos/placeholder-2.jpg',true,'Asia/Kolkata']
    ],
    Availability: [
      ['counsellor_id','weekday','start_time','end_time','active'],
      ['S001',0,'09:00','13:00',true],['S001',0,'14:00','18:00',true],
      ['S001',1,'09:00','13:00',true],['S001',1,'14:00','18:00',true],
      ['S001',2,'09:00','13:00',true],['S001',2,'14:00','18:00',true],
      ['S001',3,'09:00','13:00',true],['S001',3,'14:00','18:00',true],
      ['S001',4,'09:00','13:00',true],['S001',4,'14:00','18:00',true],
      ['S002',0,'09:00','13:00',true],['S002',0,'14:00','18:00',true],
      ['S002',1,'09:00','13:00',true],['S002',1,'14:00','18:00',true],
      ['S002',2,'09:00','13:00',true],['S002',2,'14:00','18:00',true],
      ['S002',3,'09:00','13:00',true],['S002',3,'14:00','18:00',true],
      ['S002',4,'09:00','13:00',true],['S002',4,'14:00','18:00',true]
    ],
    Leave: [['counsellor_id','date','start_time','end_time','reason']],
    Holidays: [['date','name']],
    AppointmentTypes: [
      ['id','name','duration_minutes','active'],
      [1,'Individual Counselling',60,true],[2,'Student Support',60,true],[3,'Anxiety & Stress Management',60,true],
      [4,'Parent Guidance',60,true],[5,'Self Growth',60,true],[6,'Added for testing purposes',60,true]
    ],
    Appointments: [['id','date','start_time','end_time','counsellor_id','client_name','client_age','client_gender','client_phone','client_email','appointment_type_id','appointment_type','status','created_at']]
  };

  Object.keys(definitions).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      const rows = definitions[name];
      sheet.getRange(1,1,rows.length,rows[0].length).setValues(rows);
    }
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, definitions[name][0].length);
  });
  SpreadsheetApp.getUi().alert('Antara sheets are ready. Review the Availability tab and update counsellor hours as needed.');
}

function doGet(e) {
  try {
    const action = (e.parameter.action || '').toLowerCase();
    if (action === 'health') return json_({ ok: true });
    if (action === 'counsellors') return json_({ counsellors: counsellors_() });
    if (action === 'appointmenttypes') return json_({ appointment_types: appointmentTypes_() });
    if (action === 'availability') {
      const counsellorId = String(e.parameter.counsellor_id || '');
      const date = String(e.parameter.appointment_date || '');
      const typeId = Number(e.parameter.appointment_type_id);
      const type = appointmentTypes_().find(x => x.id === typeId);
      if (!counsellorId || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !type) throw new Error('Invalid availability request');
      return json_({ date: date, duration_minutes: type.duration_minutes, slots: getSlots_(counsellorId, date, type.duration_minutes) });
    }
    return json_({ ok: true, service: 'Antara Google Sheets scheduler' });
  } catch (err) {
    return json_({ error: String(err.message || err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.action !== 'bookAppointment') throw new Error('Unknown action');

    const counsellorId = String(body.counsellor_id || '');
    const date = String(body.appointment_date || '');
    const start = timeKey_(body.start_time || '');
    const typeId = Number(body.appointment_type_id);
    const type = appointmentTypes_().find(x => x.id === typeId);
    const counsellor = counsellors_().find(x => x.id === counsellorId);
    if (!counsellor || !type || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(start)) throw new Error('Invalid booking details');

    const slots = getSlots_(counsellorId, date, type.duration_minutes);
    if (!slots.some(s => s.start_time === start)) throw new Error('Selected time is no longer available');

    const ss = spreadsheet_();
    const sheet = ss.getSheetByName(SHEETS.APPOINTMENTS);
    const end = hhmm_(minutes_(start) + type.duration_minutes);
    const id = 'A' + Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyyMMddHHmmss') + '-' + Math.floor(Math.random() * 1000);
    sheet.appendRow([id, date, start, end, counsellorId, String(body.client_name || ''), body.client_age || '', String(body.client_gender || ''), String(body.client_phone || ''), String(body.client_email || ''), typeId, type.name, 'BOOKED', new Date()]);
    return json_({ id: id, date: date, start: start, end: end, status: 'BOOKED' });
  } catch (err) {
    return json_({ error: String(err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}
