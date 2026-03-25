#!/usr/bin/env node
/**
 * Seed Test Data Script
 * ---------------------
 * This script:
 * 1. Logs in (or registers a test user if needed)
 * 2. Posts 5 test attendance courses to the backend API
 * 3. Prints the localStorage commands to paste in the browser console
 *
 * Run from project root:
 *   node seed_test_data.js
 *
 * Then copy the localStorage block printed at the end and paste it in
 * your browser DevTools console while on the dashboard page.
 */

const http = require('http');

const BASE = 'http://localhost:5001';
const TEST_USER = { name: 'Test Student', registrationNumber: '20BCS001', email: 'student@vit.ac.in', password: 'password123', department: 'CSE', year: 3 };

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['x-auth-token'] = token;
    const options = {
      hostname: 'localhost',
      port: 5001,
      path,
      method,
      headers: { ...headers, ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}) }
    };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

/** 5 test courses with rich history **/
const courses = [
  {
    subject: 'Data Structures', room: 'AB1-101', slot: 'A', faculty: 'Dr. Kumar',
    time: '08:00', days: ['MON', 'WED', 'FRI'], courseCode: 'CS3001', credits: 4,
    history: [
      '2026-01-05','2026-01-07','2026-01-09','2026-01-12',
      { date: '2026-01-14', status: 'Absent' },
      '2026-01-16','2026-01-19','2026-01-21','2026-01-23',
      { date: '2026-01-26', status: 'Absent' },
      '2026-01-28','2026-01-30','2026-02-02','2026-02-04','2026-02-06',
      '2026-02-09','2026-02-11',
      { date: '2026-02-13', status: 'Absent' },
      '2026-02-16','2026-02-18','2026-02-20','2026-02-23',
      '2026-02-25','2026-02-27','2026-03-02',
      { date: '2026-03-04', status: 'Absent' },
      '2026-03-06','2026-03-09','2026-03-11','2026-03-13',
      '2026-03-16','2026-03-18','2026-03-20',
    ].map(d => typeof d === 'string' ? { date: d, status: 'Present' } : d),
  },
  {
    subject: 'Operating Systems', room: 'SJT-309', slot: 'B', faculty: 'Dr. Priya',
    time: '09:00', days: ['MON', 'TUE', 'THU'], courseCode: 'CS3002', credits: 3,
    history: [
      '2026-01-05',
      { date: '2026-01-06', status: 'Absent' },{ date: '2026-01-08', status: 'Absent' },
      { date: '2026-01-12', status: 'Absent' },{ date: '2026-01-13', status: 'Absent' },
      '2026-01-15','2026-01-19',
      { date: '2026-01-20', status: 'Absent' },
      '2026-01-22',
      { date: '2026-01-26', status: 'Absent' },{ date: '2026-01-27', status: 'Absent' },
      '2026-01-29',
      { date: '2026-02-02', status: 'Absent' },{ date: '2026-02-03', status: 'Absent' },
      '2026-02-05','2026-02-09',
      { date: '2026-02-10', status: 'Absent' },{ date: '2026-02-12', status: 'Absent' },
      '2026-02-16','2026-02-17',
      { date: '2026-02-19', status: 'Absent' },
      '2026-02-23','2026-02-24','2026-02-26',
      { date: '2026-03-02', status: 'Absent' },{ date: '2026-03-03', status: 'Absent' },
      '2026-03-05','2026-03-09','2026-03-10',
      { date: '2026-03-12', status: 'Absent' },
      '2026-03-16','2026-03-17','2026-03-19',
    ].map(d => typeof d === 'string' ? { date: d, status: 'Present' } : d),
  },
  {
    subject: 'Computer Networks', room: 'TT-412', slot: 'C', faculty: 'Dr. Raj',
    time: '10:00', days: ['TUE', 'THU', 'FRI'], courseCode: 'CS3003', credits: 4,
    history: [
      '2026-01-06','2026-01-08','2026-01-09','2026-01-13','2026-01-15','2026-01-16',
      '2026-01-20','2026-01-22',
      { date: '2026-01-23', status: 'Absent' },
      '2026-01-27','2026-01-29','2026-01-30',
      { date: '2026-02-03', status: 'Absent' },
      '2026-02-05','2026-02-06','2026-02-10','2026-02-12','2026-02-13',
      '2026-02-17','2026-02-19','2026-02-20','2026-02-24',
      { date: '2026-02-26', status: 'Absent' },
      '2026-02-27','2026-03-03','2026-03-05','2026-03-06',
      '2026-03-10','2026-03-12','2026-03-13','2026-03-17','2026-03-19','2026-03-20',
    ].map(d => typeof d === 'string' ? { date: d, status: 'Present' } : d),
  },
  {
    subject: 'Database Systems', room: 'MB-201', slot: 'D', faculty: 'Dr. Meena',
    time: '11:00', days: ['MON', 'WED', 'FRI'], courseCode: 'CS3004', credits: 4,
    history: [
      '2026-01-05','2026-01-07','2026-01-09','2026-01-12','2026-01-14','2026-01-16',
      '2026-01-19','2026-01-21','2026-01-23','2026-01-26','2026-01-28','2026-01-30',
      { date: '2026-02-02', status: 'Absent' },
      '2026-02-04','2026-02-06','2026-02-09','2026-02-11','2026-02-13',
      '2026-02-16','2026-02-18','2026-02-20','2026-02-23','2026-02-25','2026-02-27',
      '2026-03-02','2026-03-04','2026-03-06','2026-03-09','2026-03-11','2026-03-13',
      '2026-03-16','2026-03-18','2026-03-20',
    ].map(d => typeof d === 'string' ? { date: d, status: 'Present' } : d),
  },
  {
    subject: 'Software Engineering', room: 'GDN-102', slot: 'E', faculty: 'Dr. Anand',
    time: '14:00', days: ['TUE', 'WED'], courseCode: 'CS3005', credits: 3,
    history: [
      '2026-01-06','2026-01-07',
      { date: '2026-01-13', status: 'Absent' },
      '2026-01-14','2026-01-20',
      { date: '2026-01-21', status: 'Absent' },
      '2026-01-27','2026-01-28',
      { date: '2026-02-03', status: 'Absent' },
      '2026-02-04','2026-02-10','2026-02-11',
      { date: '2026-02-17', status: 'Absent' },
      '2026-02-18','2026-02-24','2026-02-25','2026-03-03',
      { date: '2026-03-04', status: 'Absent' },
      '2026-03-10','2026-03-11','2026-03-17','2026-03-18',
    ].map(d => typeof d === 'string' ? { date: d, status: 'Present' } : d),
  }
].map(c => {
  const attended = c.history.filter(h => h.status === 'Present' || h.status === 'On Duty').length;
  const total = c.history.filter(h => h.status !== 'Ignored').length;
  return { ...c, attendedClasses: attended, totalClasses: total };
});

/** grades matching the subjects above **/
const gradesLocalStorage = [
  { name: 'Data Structures',      credits: 4, grade: 'A'  }, // 9 pts  ~88% att => moderate
  { name: 'Operating Systems',    credits: 3, grade: 'C'  }, // 7 pts  ~58% att => red / at risk
  { name: 'Computer Networks',    credits: 4, grade: 'S'  }, // 10 pts ~91% att => high
  { name: 'Database Systems',     credits: 4, grade: 'O'  }, // 10 pts ~97% att => high
  { name: 'Software Engineering', credits: 3, grade: 'D'  }, // 6 pts  ~77% att => borderline
];

async function main() {
  console.log('\n🚀  VIT Dashboard — Test Data Seeder\n');

  // 1. Login
  console.log('→ Logging in...');
  let loginRes = await request('POST', '/api/auth/login', { email: TEST_USER.email, password: TEST_USER.password });

  if (loginRes.status !== 200) {
    console.log('  Login failed, attempting registration...');
    const regRes = await request('POST', '/api/auth/register', TEST_USER);
    if (regRes.status === 200 || regRes.status === 201) {
      loginRes = regRes;
      console.log('  ✅ Registered successfully');
    } else {
      console.error('  ❌ Registration failed:', regRes.body);
      process.exit(1);
    }
  } else {
    console.log('  ✅ Logged in successfully');
  }

  const token = loginRes.body.token;
  if (!token) { console.error('  ❌ No token received'); process.exit(1); }

  // 2. Add attendance courses
  console.log('\n→ Adding 5 attendance courses...');
  for (const course of courses) {
    const res = await request('POST', '/api/student/attendance', course, token);
    const pct = Math.round((course.attendedClasses / course.totalClasses) * 100);
    const status = res.status === 200 || res.status === 201 ? '✅' : '❌';
    console.log(`  ${status} [${pct}%] ${course.subject} — HTTP ${res.status}`);
  }

  // 3. Print localStorage commands
  console.log('\n─────────────────────────────────────────────');
  console.log('📋  STEP 2: Open your browser DevTools console');
  console.log('    (http://localhost:5173 → F12 → Console tab)');
  console.log('    Then paste the following block and press Enter:\n');

  const localStorageScript = `
// ── Paste this ENTIRE block in the browser console ──
localStorage.setItem('token', '${token}');
localStorage.setItem('semesterStartDate', '2026-01-01');
localStorage.setItem('lastInstructionalDay', '2026-04-30');
localStorage.setItem('current_subjects', JSON.stringify(${JSON.stringify(gradesLocalStorage, null, 2)}));
window.dispatchEvent(new Event('storage'));
console.log('✅ localStorage seeded! Reload the page now.');
// ──────────────────────────────────────────────────`;

  console.log(localStorageScript);
  console.log('─────────────────────────────────────────────');
  console.log('\n✅ Done! After pasting, refresh the dashboard page.');
  console.log('   The "Attendance vs CGPA Analytics" section should');
  console.log('   now show 5 data points with a regression trendline.\n');
}

main().catch(err => { console.error('Fatal error:', err.message); process.exit(1); });
