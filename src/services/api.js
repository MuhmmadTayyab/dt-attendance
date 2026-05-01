import axios from 'axios';

const client = axios.create({
  baseURL: 'https://darultaqwa.org/_app/api/staff',
  timeout: 15000,
});

const negativeWords = ['invalid', 'wrong', 'error', 'fail', 'not found', 'false', 'نامکمل', 'غلط'];

function cleanString(value) {
  return String(value ?? '').trim();
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
    },
  });

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

function statusToUrdu(status) {
  const value = cleanString(status).toLowerCase();
  if (!value) return 'نامعلوم';
  if (['present', 'p', '1', 'حاضر'].includes(value) || value.includes('present')) return 'حاضر';
  if (['absent', 'a', '0', 'غیر حاضر'].includes(value) || value.includes('absent')) return 'غیر حاضر';
  if (['leave', 'l', 'رخصت'].includes(value) || value.includes('leave')) return 'رخصت';
  return cleanString(status);
}

function unwrapAttendance(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  const possibleKeys = ['data', 'attendance', 'records', 'record', 'result', 'rows'];
  for (const key of possibleKeys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  return [];
}

export async function getAttendance(employeeId, filters = {}) {
  const params = {
    action: 'get_attendance',
    id: employeeId,
  };

  if (filters.month) params.month = filters.month;
  if (filters.year) params.year = filters.year;

  const { data } = await client.get('/attendance.php', { params });
  const rows = unwrapAttendance(data);

  return rows.map((item, index) => ({
    id: cleanString(pickValue(item, ['id', 'attendance_id'])) || `${index}`,
    date: cleanString(pickValue(item, ['date', 'attendance_date', 'day', 'tareekh', 'تاریخ'])),
    arrival: cleanString(pickValue(item, ['arrival', 'time_in', 'in_time', 'check_in', 'login_time', 'وقتِ آمد'])),
    departure: cleanString(pickValue(item, ['departure', 'time_out', 'out_time', 'check_out', 'logout_time', 'وقتِ روانگی'])),
    status: statusToUrdu(pickValue(item, ['status', 'attendance_status', 'حیثیت', 'اسٹیٹس'])),
  }));
}
