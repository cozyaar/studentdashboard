// Student Dashboard - Local Data Service
// This service replaces the need for a real Node/Express/MongoDB backend
// by using the browser's localStorage for all academic data.

const STORAGE_KEYS = {
  USER: 'student_user',
  TOKEN: 'token',
  HACKATHONS: 'student_hackathons',
  ATTENDANCE: 'student_attendance',
  PROJECTS: 'student_projects',
  SKILLS: 'student_skills',
  GRADES: 'current_subjects',
  AUTH: 'auth_state'
};

const getJSON = (key, defaultVal = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setJSON = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

export const DataService = {
  // --- AUTH ---
  login: async (email, password) => {
    // Mock login logic - always succeeds for demo
    const user = { name: 'Lithesh', email, role: 'Student' };
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock-jwt-token');
    setJSON(STORAGE_KEYS.USER, user);
    return { ok: true, user, token: 'mock-jwt-token' };
  },

  register: async (userData) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock-jwt-token');
    setJSON(STORAGE_KEYS.USER, userData);
    return { ok: true, user: userData, token: 'mock-jwt-token' };
  },

  // --- DASHBOARD AGGREGATE ---
  getDashboardData: async () => {
    return {
      hackathons: getJSON(STORAGE_KEYS.HACKATHONS),
      attendance: getJSON(STORAGE_KEYS.ATTENDANCE),
      projects: getJSON(STORAGE_KEYS.PROJECTS),
      skills: getJSON(STORAGE_KEYS.SKILLS),
      grades: getJSON(STORAGE_KEYS.GRADES)
    };
  },

  // --- ATTENDANCE ---
  addAttendance: async (course) => {
    const data = getJSON(STORAGE_KEYS.ATTENDANCE);
    const newItem = { ...course, _id: Date.now().toString() };
    data.push(newItem);
    setJSON(STORAGE_KEYS.ATTENDANCE, data);
    return { ok: true, data: newItem };
  },

  updateAttendance: async (id, updated) => {
    const data = getJSON(STORAGE_KEYS.ATTENDANCE);
    const idx = data.findIndex(item => item._id === id);
    if (idx !== -1) {
      data[idx] = { ...data[idx], ...updated };
      setJSON(STORAGE_KEYS.ATTENDANCE, data);
    }
    return { ok: true };
  },

  deleteAttendance: async (id) => {
    const data = getJSON(STORAGE_KEYS.ATTENDANCE).filter(item => item._id !== id);
    setJSON(STORAGE_KEYS.ATTENDANCE, data);
    return { ok: true };
  },

  // --- HACKATHONS ---
  addHackathon: async (h) => {
    const data = getJSON(STORAGE_KEYS.HACKATHONS);
    const newItem = { ...h, _id: Date.now().toString() };
    data.push(newItem);
    setJSON(STORAGE_KEYS.HACKATHONS, data);
    return { ok: true, data: newItem };
  },

  updateHackathon: async (id, updated) => {
    const data = getJSON(STORAGE_KEYS.HACKATHONS);
    const idx = data.findIndex(item => item._id === id);
    if (idx !== -1) {
      data[idx] = { ...data[idx], ...updated };
      setJSON(STORAGE_KEYS.HACKATHONS, data);
    }
    return { ok: true };
  },

  deleteHackathon: async (id) => {
    const data = getJSON(STORAGE_KEYS.HACKATHONS).filter(item => item._id !== id);
    setJSON(STORAGE_KEYS.HACKATHONS, data);
    return { ok: true };
  },

  // --- GENERIC ---
  addGeneric: async (type, item) => {
    const key = STORAGE_KEYS[type.toUpperCase()] || type;
    const data = getJSON(key);
    const newItem = { ...item, _id: Date.now().toString() };
    data.push(newItem);
    setJSON(key, data);
    return { ok: true, data: newItem };
  }
};
