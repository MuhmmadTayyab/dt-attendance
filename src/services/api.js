import axios from 'axios';
import { CURRENT_VERSION, STAFF_API_BASE_URL } from '../config/appVersion';

const client = axios.create({
  baseURL: STAFF_API_BASE_URL,
  timeout: 15000,
});

const negativeWords = ['invalid', 'wrong', 'error', 'fail', 'not found', 'false', 'نامکمل', 'غلط'];

export function getPreviousMonthParams(date = new Date()) {
  const previous = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return {
    month: previous.getMonth() + 1,
    year: previous.getFullYear(),
  };
}

function cleanString(value) {
  return String(value ?? '').trim();
}

function translateApiMessage(message) {
  const text = cleanString(message).toLowerCase();
  if (!text) return 'حاضری کا ریکارڈ حاصل نہیں ہو سکا۔';
  if (text.includes('missing') || text.includes('invalid staff id')) return 'ملازم نمبر درست نہیں ہے۔';
  if (text.includes('invalid month')) return 'مہینہ درست نہیں ہے۔';
  if (text.includes('invalid year')) return 'سال درست نہیں ہے۔';
  if (text.includes('network')) return 'نیٹ ورک مسئلہ ہے۔ براہ کرم دوبارہ کوشش کریں۔';
  if (text.includes('invalid credentials')) return 'شناختی معلومات درست نہیں ہیں۔';
  return message;
}

function valueMeansSuccess(value) {
  if (value === true || value === 1) return true;
  const text = cleanString(value).toLowerCase();
  return ['1', 'true', 'success', 'successful', 'ok', 'yes', 'login'].includes(text);
}

function valueMeansFailure(value) {
  if (value === false || value === 0) return true;
  const text = cleanString(value).toLowerCase();
  return text === '0' || negativeWords.some((word) => text.includes(word));
}

function isLoginSuccessful(payload) {
  if (Array.isArray(payload)) {
    return payload.length > 0 && !payload.some((item) => valueMeansFailure(item?.status || item?.success || item?.message));
  }

  if (payload && typeof payload === 'object') {
    const candidates = [
      payload.success,
      payload.status,
      payload.result,
      payload.login,
      payload.auth,
      payload.code,
    ];

    if (candidates.some(valueMeansSuccess)) return true;
    if (candidates.some(valueMeansFailure)) return false;
    if (valueMeansFailure(payload.message || payload.error)) return false;
    return Object.keys(payload).length > 0 && !payload.error;
  }

  if (typeof payload === 'string' || typeof payload === 'number' || typeof payload === 'boolean') {
    if (valueMeansFailure(payload)) return false;
    return valueMeansSuccess(payload) || cleanString(payload).length > 0;
  }

  return false;
}

export async function loginStaff(employeeId, idCard) {
  const { data } = await client.get('/login.php', {
    params: {
      action: 'chk_login674',
      id: employeeId,
      'id-card': idCard,
      'app-version': CURRENT_VERSION,
    },
  });

  console.log('LOGIN API RESPONSE:', data);

  if (!isLoginSuccessful(data)) {
    throw new Error('شناختی معلومات درست نہیں ہیں۔ دوبارہ کوشش کریں۔');
  }

  return data;
}

function pickValue(item, keys) {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null && cleanString(item[key]) !== '') {
      return item[key];
    }
  }
  return '';
}

function getByPath(source, path) {
  return path.reduce((current, key) => current?.[key], source);
}

function looksLikeAttendanceRow(item) {
  if (!item || typeof item !== 'object') return false;
  return Boolean(
    item.date ||
      item.attendance_date ||
      item.sign_in ||
      item.sign_out ||
      item.time_in ||
      item.time_out ||
      item.status ||
      item.attendance_status,
  );
}

function findAttendanceArrayDeep(source, seen = new Set()) {
  if (!source || typeof source !== 'object' || seen.has(source)) return null;
  seen.add(source);

  if (Array.isArray(source)) {
    return source.some(looksLikeAttendanceRow) ? source : null;
  }

  for (const value of Object.values(source)) {
    const found = findAttendanceArrayDeep(value, seen);
    if (found) return found;
  }

  return null;
}

function unwrapAttendance(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') {
    throw new Error('حاضری کا جواب درست فارمیٹ میں نہیں ہے۔');
  }

  if (payload.success === false) {
    const message = cleanString(payload.message || payload.error);
    throw new Error(translateApiMessage(message));
  }

  const paths = [
    ['data'],
    ['attendance'],
    ['records'],
    ['record'],
    ['rows'],
    ['attendance', 'records'],
    ['attendance', 'data'],
    ['attendance', 'rows'],
    ['data', 'records'],
    ['data', 'attendance'],
    ['result', 'records'],
    ['result', 'data'],
    ['response', 'data'],
    ['response', 'attendance'],
    ['attendanceList'],
    ['staffAttendance'],
  ];

  for (const path of paths) {
    const value = getByPath(payload, path);
    if (Array.isArray(value)) return value;
  }

  const deepArray = findAttendanceArrayDeep(payload);
  if (deepArray) return deepArray;

  if (payload.success === true) return [];

  throw new Error('حاضری کا ریکارڈ جواب میں موجود نہیں ہے۔');
}

function statusToUrdu(status, item = {}) {
  const value = cleanString(status).toLowerCase();
  const signInStatus = cleanString(item.status_sign_in).toLowerCase();
  const signOutStatus = cleanString(item.status_sign_out).toLowerCase();
  const details = cleanString(item.details).toLowerCase();
  const combined = `${value} ${signInStatus} ${signOutStatus} ${details}`;

  if (combined.includes('weekend')) return 'ہفتہ وار چھٹی';
  if (combined.includes('leave') || combined.includes('رخصت')) return 'رخصت';
  if (combined.includes('absent') || combined.includes('غیر حاضر')) return 'غیر حاضر';
  if (combined.includes('late') || combined.includes('تاخیر')) return 'تاخیر';
  if (combined.includes('present') || combined.includes('حاضر')) return 'حاضر';
  if (['p', '1'].includes(value)) return 'حاضر';
  if (['a', '0'].includes(value)) return 'غیر حاضر';
  return cleanString(status) || 'نامعلوم';
}

function parseLateMinutes(item) {
  const raw = cleanString(pickValue(item, ['late_minutes', 'lateMinutes', 'late_min', 'minutes_late', 'delay_minutes', 'late']));
  if (!raw) return 0;

  if (/^\d+:\d{2}(:\d{2})?$/.test(raw)) {
    const parts = raw.split(':').map((part) => Number(part));
    if (parts.length === 3) return parts[0] * 60 + parts[1];
    return parts[0] * 60 + parts[1];
  }

  const match = raw.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function normalizeAttendanceRow(item, index) {
  return {
    id: cleanString(pickValue(item, ['id', 'attendance_id'])) || `${index}`,
    date: cleanString(pickValue(item, ['date', 'attendance_date', 'att_date', 'tareekh', 'تاریخ'])),
    day: cleanString(pickValue(item, ['day', 'weekday', 'attendance_day', 'دن'])),
    arrival: cleanString(pickValue(item, ['sign_in', 'arrival', 'time_in', 'in_time', 'check_in', 'login_time', 'وقتِ آمد'])),
    departure: cleanString(pickValue(item, ['sign_out', 'departure', 'time_out', 'out_time', 'check_out', 'logout_time', 'وقتِ روانگی'])),
    status: statusToUrdu(pickValue(item, ['status', 'attendance_status', 'حیثیت', 'اسٹیٹس']), item),
    staffName: cleanString(pickValue(item, ['staff_name', 'employee_name', 'name', 'full_name', 'teacher_name', 'نام'])),
    branchName: cleanString(pickValue(item, ['branch_name', 'branch', 'campus', 'department', 'برانچ'])),
    lateMinutes: parseLateMinutes(item),
    statusSignIn: cleanString(item.status_sign_in),
    statusSignOut: cleanString(item.status_sign_out),
    source: item,
  };
}

export async function getAttendance(employeeId, idCardOrFilters = {}, maybeFilters = {}) {
  const idCard = typeof idCardOrFilters === 'string' ? idCardOrFilters : idCardOrFilters?.idCard;
  const filters = typeof idCardOrFilters === 'string' ? maybeFilters : idCardOrFilters;
  const previousMonth = getPreviousMonthParams();
  const month = Number(filters.month || previousMonth.month);
  const year = Number(filters.year || previousMonth.year);

  if (!employeeId) {
    throw new Error('ملازم نمبر موجود نہیں ہے۔');
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error('مہینہ درست نہیں ہے۔');
  }

  if (!Number.isInteger(year) || year < 2000) {
    throw new Error('سال درست نہیں ہے۔');
  }

  const params = {
    action: 'get_attendance',
    'id-card': idCard,
    id: employeeId,
    month,
    year,
    'app-version': CURRENT_VERSION,
  };

  try {
    const response = await client.get('/attendance.php', { params });
    console.log('ATTENDANCE API PARAMS:', params);
    console.log('ATTENDANCE API RESPONSE:', response.data);

    const rows = unwrapAttendance(response.data);
    return rows.map(normalizeAttendanceRow);
  } catch (error) {
    console.log('ATTENDANCE API ERROR:', error?.response?.data || error?.message || error);

    if (error?.response?.data) {
      const message = cleanString(error.response.data.message || error.response.data.error);
      throw new Error(translateApiMessage(message));
    }

    if (error?.message) {
      throw error;
    }

    throw new Error('نیٹ ورک مسئلہ ہے۔ براہ کرم دوبارہ کوشش کریں۔');
  }
}
