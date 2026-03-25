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
    const user = { name: 'Demo Student', email, role: 'Student', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student' };
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock-jwt-token');
    setJSON(STORAGE_KEYS.USER, user);
    
    // Seed demo data if it's the specific demo account or if storage is empty
    if (email === 'student@vitstudent.ac.in') {
      DataService.seedDemoData();
    }
    
    return { ok: true, user, token: 'mock-jwt-token' };
  },

  seedDemoData: () => {
    const demoAttendance = [
      { 
        _id: 'a1', subject: 'Data Structures & Algorithms', room: 'TT401', slot: 'A1+TA1', 
        days: ['MON', 'WED', 'FRI'], history: [], credits: 4, courseCode: 'CSE1001' 
      },
      { 
        _id: 'a2', subject: 'Operating Systems', room: 'SJT302', slot: 'B1+TB1', 
        days: ['TUE', 'THU'], history: [
          { date: new Date().toISOString().split('T')[0], status: 'Present' }
        ], credits: 3, courseCode: 'CSE1002' 
      },
      { 
        _id: 'a3', subject: 'Computer Networks', room: 'TT201', slot: 'C2+TC2', 
        days: ['MON', 'THU'], history: [], credits: 4, courseCode: 'CSE1003' 
      },
      { 
        _id: 'a4', subject: 'Database Systems', room: 'TT501', slot: 'D1+TD1', 
        days: ['WED', 'FRI'], history: [], credits: 3, courseCode: 'CSE1004' 
      }
    ];

    const demoHackathons = [
      {
        _id: 'h1', name: 'ETHGlobal India', organizer: 'ETHGlobal', role: 'Winner', teamSize: 4,
        startDate: '2026-02-01', endDate: '2026-02-03', skills: ['Solidity', 'React', 'Web3'],
        description: 'Built a decentralized student dashboard with zero-knowledge proofs.',
        certificateUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=800&auto=format&fit=crop'
      },
      {
        _id: 'h2', name: 'Smart India Hackathon', organizer: 'AICTE', role: 'Finalist', teamSize: 6,
        startDate: '2026-01-15', endDate: '2026-01-16', skills: ['Python', 'Machine Learning', 'API'],
        description: 'Developed an automated grading system for academic institutions.',
        certificateUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop'
      }
    ];

    const demoProjects = [
      {
        id: 'p1', projectName: 'AI Career Path Predictor', type: 'Major', skills: ['Python', 'React', 'NLP'],
        submissionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        reviews: [
          { id: 'r1', title: 'Abstract Submission', completed: true, date: '2026-03-01' },
          { id: 'r2', title: 'Prototype Review', completed: false, date: new Date().toISOString() }
        ]
      },
      {
        id: 'p2', projectName: 'Portfolio Hub', type: 'Minor', skills: ['React', 'Tailwind', 'Vite'],
        submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        reviews: [
          { id: 'r1', title: 'Final Review', completed: true, date: '2026-03-20' }
        ]
      }
    ];

    const demoGrades = [
      { name: 'Data Structures', credits: 4, grade: 'S' },
      { name: 'Operating Systems', credits: 3, grade: 'A' },
      { name: 'Computer Networks', credits: 4, grade: 'B' },
      { name: 'Database Systems', credits: 3, grade: 'S' },
      { name: 'Soft Skills', credits: 2, grade: 'O' }
    ];

    setJSON(STORAGE_KEYS.ATTENDANCE, demoAttendance);
    setJSON(STORAGE_KEYS.HACKATHONS, demoHackathons);
    setJSON(STORAGE_KEYS.PROJECTS, demoProjects);
    setJSON(STORAGE_KEYS.GRADES, demoGrades);
    localStorage.setItem('user_cgpa', '9.42');
    localStorage.setItem('lastInstructionalDay', '2026-05-30');
    localStorage.setItem('semesterStartDate', '2026-01-15');
    
    window.dispatchEvent(new Event('storage'));
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
