const sessions = [
  { number: 1, tag: 'Day 1', filterKey: 'day-1', type: 'talk', date: '2 October 2026', day: 'Friday', time: '6:00 PM–7:15 PM PKT', end: '7:30 PM–8:45 PM PKT', title: 'Foundations — Qubits, Gates & Superposition', formLink: 'https://forms.gle/WNx5xcZ9uoygQLXt6', speaker: 'Dustin Rippe; Fatima Shahzadi', speakerTopics: [
    { name: 'Dustin Rippe', topics: ['Introduction to Quantum Computing', 'Python environment setup for Qiskit 2.x', 'Vectors, matrices and inner products', 'Qiskit Statevector and Operator'] },
    { name: 'Fatima Shahzadi', topics: ['Single-qubit gates: X, H, Z, Y, S, T', 'Superposition'] }
  ] },
  { number: 2, tag: 'Day 2', filterKey: 'day-2', type: 'talk', date: '3 October 2026', day: 'Saturday', time: '6:00 PM–8:30 PM PKT', end: '', breakNote: 'Break: 7:15 PM–7:30 PM PKT', title: 'Measurement, Circuits & Qiskit Patterns', formLink: 'https://forms.gle/NCrChB2qh49ey5Zo9', speaker: 'Saad Ejaz', topics: ['Measurement', 'Bloch sphere visualization', 'Introduction to state tomography', 'Qiskit Patterns: Map, Optimize, Execute, Post-process', 'Sampler Primitive', 'Estimator Primitive'] },
  { number: 3, tag: 'Day 3', filterKey: 'day-3', type: 'talk', date: '4 October 2026', day: 'Sunday', time: '6:00 PM–8:30 PM PKT', end: '', breakNote: 'Break: 7:15 PM–7:30 PM PKT', title: 'Multi-Qubit Circuits & Entanglement', formLink: 'https://forms.gle/g9JkxJLBYn6qrKd58', speaker: 'Fatima Shahzadi', topics: ['Multi-qubit state representation', 'Tensor products', 'Entanglement and lab demonstration', 'Bell states', 'GHZ states'] },
  { number: 4, tag: 'Day 4', filterKey: 'day-4', type: 'talk', date: '9 October 2026', day: 'Friday', time: '6:00 PM–8:30 PM PKT', end: '', breakNote: 'Break: 7:15 PM–7:30 PM PKT', title: 'Circuit Optimization & Transpilation', formLink: 'https://forms.gle/ryrEfxhZbJrDyzsXA', speaker: 'Dustin Rippe', topics: ['Circuit depth: what it is and why it matters', 'Reducing depth: fan-out vs. chain; recursive fan-out', 'Transpilation deep dive', 'GHZ optimization: fan-out, chain, recursive', 'Heavy-Hex topology'] },
  { number: 5, tag: 'Day 5', filterKey: 'day-5', type: 'talk', date: '10 October 2026', day: 'Saturday', time: '6:00 PM–7:15 PM PKT', end: '7:30 PM–8:45 PM PKT', title: 'Noise, Backends & Real Hardware', formLink: 'https://forms.gle/4sJUiqQUecVndv839', speaker: 'Dustin Rippe; Muhammad Khizar', speakerTopics: [
    { name: 'Dustin Rippe', topics: ['Noise in quantum computers: types of noise and sources', 'Noisy simulation', 'Noise models: depolarization, Pauli, thermal'] },
    { name: 'Muhammad Khizar', topics: ['Quantum microprocessor (advanced topic)', 'Backend properties: T1, T2, gate errors, readout errors'] }
  ] },
  { number: 6, tag: 'Day 6', filterKey: 'day-6', type: 'talk', date: '11 October 2026', day: 'Sunday', time: '6:00 PM–7:45 PM PKT', end: '8:00 PM–8:45 PM PKT', title: 'Dynamic Circuits & Parameterized Circuits', formLink: 'https://forms.gle/QKHtyFNgtkfAwwai9', speaker: 'Fatima Shahzadi', speakerTopics: [
    { name: 'Fatima Shahzadi', topics: ['Classical registers', 'Mid-circuit measurement', 'Conditional logic', 'Dynamic circuits: step-by-step explanation'] },
    { name: 'Fatima Shahzadi', topics: ['Parameter and ParameterVector', 'Real-world quantum applications'] }
  ] },
  { number: 7, tag: 'Day 7 — Hackathon', filterKey: 'hackathon', type: 'connect', date: '25 October 2026', day: 'Sunday', time: '2:00 PM–6:00 PM PKT', end: '', title: 'Hackathon & Project Day', speaker: 'All Guest Speakers', topics: ['Hackathon tips & tricks', 'Hackathon project work & presentations', 'Lab Notebooks', 'Presentation Slides'] },
  { number: 8, tag: 'Lab 0', filterKey: 'lab-0', type: 'workshop', title: 'Lab 0', formLink: 'https://forms.gle/c4oa7djRjmJgzj9F9', speaker: 'Noor Ul Ain', labNote: 'Lab Instructor and the Assistants will be available on Discord to address any lab related questions as soon as the lab materials are published to the GitHub repository.', isLab: true },
  { number: 9, tag: 'Lab 1', filterKey: 'lab-1', type: 'workshop', title: 'Lab 1', formLink: 'https://forms.gle/to4D7AD8BP3RGX1S9', speaker: 'Noor Ul Ain', labNote: 'Lab Instructor and the Assistants will be available on Discord to address any lab related questions as soon as the lab materials are published to the GitHub repository.', isLab: true },
  { number: 10, tag: 'Lab 2', filterKey: 'lab-2', type: 'workshop', title: 'Lab 2', formLink: 'https://forms.gle/zhUJbseW5fYBgiaE7', speaker: 'Noor Ul Ain', labNote: 'Lab Instructor and the Assistants will be available on Discord to address any lab related questions as soon as the lab materials are published to the GitHub repository.', isLab: true }
];
const scheduleList = document.querySelector('#scheduleList');
const filterButtons = document.querySelectorAll('[data-filter]');
function topicsMarkup(session) { if (session.speakerTopics) return session.speakerTopics.map((group) => `<p class="topic-speaker"><strong>${group.name}:</strong></p><ul class="schedule-topics">${group.topics.map((topic) => `<li>${topic}</li>`).join('')}</ul>`).join(''); if (session.topics) return `<ul class="schedule-topics">${session.topics.map((topic) => `<li>${topic}</li>`).join('')}</ul>`; return ''; }
function arrowMarkup(session) { return session.formLink ? `<a class="schedule-arrow" href="${session.formLink}" target="_blank" rel="noopener noreferrer" aria-label="Open registration form">↗</a>` : `<span class="schedule-arrow">↗</span>`; }
function renderSchedule(filter = 'all') { scheduleList.innerHTML = sessions.filter((session) => filter === 'all' || session.filterKey === filter).map((session, index) => `<article class="schedule-row ${index === 1 ? 'highlight-row' : ''}"><div class="schedule-time">${session.isLab ? '' : `<strong>${session.time}</strong>${session.end ? `<span>${session.end}</span>` : ''}`}</div><div class="schedule-info"><span class="session-tag tag-${session.type}">${session.tag}</span><h3>${session.title}</h3>${session.isLab ? `<p><strong>Speaker/Instructor:</strong> ${session.speaker}</p><p>${session.labNote}</p>` : `<p><strong>Date:</strong> ${session.date} • <strong>Day:</strong> ${session.day} • <strong>Time:</strong> ${session.time}${session.end ? ` / ${session.end}` : ''}${session.breakNote ? ` • <strong>${session.breakNote}</strong>` : ''} • <strong>Speaker/Instructor:</strong> ${session.speaker}</p>`}${topicsMarkup(session)}</div>${arrowMarkup(session)}</article>`).join(''); }
renderSchedule();
filterButtons.forEach((button) => button.addEventListener('click', () => { filterButtons.forEach((item) => item.classList.remove('active')); button.classList.add('active'); renderSchedule(button.dataset.filter); }));
const mobileMenu = document.querySelector('#mobileMenu');
const nav = document.querySelector('#mainNav');
mobileMenu.addEventListener('click', () => { nav.classList.toggle('is-open'); mobileMenu.querySelector('span').textContent = nav.classList.contains('is-open') ? '×' : '+'; });
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => nav.classList.remove('is-open')));
const API_BASE = window.API_BASE_URL || 'http://localhost:4000/api';
const accountTrigger = document.querySelector('#accountTrigger');
const accountOverlay = document.querySelector('#accountOverlay');
const accountClose = document.querySelector('#accountClose');
const authView = document.querySelector('#authView');
const accountView = document.querySelector('#accountView');
const authForm = document.querySelector('#authForm');
const authMessage = document.querySelector('#authMessage');
const nameField = document.querySelector('#nameField');
const accountTitle = document.querySelector('#accountTitle');
const authSubmit = document.querySelector('#authSubmit');
const authModes = document.querySelectorAll('[data-auth-mode]');
let authMode = 'login';
let isAuthenticated = false;
function setAuthMode(mode) { authMode = mode; authModes.forEach((button) => button.classList.toggle('active', button.dataset.authMode === mode)); const signup = mode === 'signup'; nameField.hidden = !signup; nameField.querySelector('input').required = signup; accountTitle.innerHTML = signup ? 'Join the<br /><em>community.</em>' : 'Welcome<br /><em>back.</em>'; authSubmit.innerHTML = signup ? 'Create account <span>↗</span>' : 'Log in <span>↗</span>'; authMessage.textContent = ''; }
// Forces the full-screen gate open and undismissable while unauthenticated.
function lockSite() { isAuthenticated = false; currentUserRole = null; authView.hidden = false; accountView.hidden = true; accountOverlay.hidden = false; accountClose.hidden = true; accountTrigger.hidden = true; setAuthMode('login'); }
let currentUserRole = null;
function unlockSite(role) { isAuthenticated = true; currentUserRole = role; accountOverlay.hidden = true; accountClose.hidden = true; authView.hidden = false; accountView.hidden = true; accountTrigger.hidden = false; accountTrigger.innerHTML = role === 'admin' ? 'Admin <span>↗</span>' : 'Logout <span>↗</span>'; }
function openAdminDashboard() { accountOverlay.hidden = false; accountClose.hidden = false; authView.hidden = true; accountView.hidden = false; document.querySelector('#accountRoleLabel').textContent = 'ADMIN CONSOLE'; document.querySelector('#accountGreeting').innerHTML = 'Admin<br /><em>dashboard.</em>'; document.querySelector('#accountStatus').textContent = 'You have administrator access.'; loadAdminData(document.querySelector('#accountData')); }
function closeAccountPanel() { if (!isAuthenticated) return; accountOverlay.hidden = true; }
function authHeaders() { return { Authorization: `Bearer ${localStorage.getItem('qiskitToken')}` }; }
function showAuthError(message) { authMessage.textContent = message; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]); }
async function loadAdminData(container) { const [usersResponse, submissionsResponse] = await Promise.all([fetch(`${API_BASE}/admin/users`, { headers: authHeaders() }), fetch(`${API_BASE}/admin/submissions`, { headers: authHeaders() })]); if (!usersResponse.ok || !submissionsResponse.ok) throw new Error('Admin data unavailable.'); const users = (await usersResponse.json()).users; const submissions = (await submissionsResponse.json()).submissions; container.innerHTML = `<div class="admin-stat"><strong>${users.length}</strong><small>USERS</small></div><div class="admin-stat"><strong>${submissions.length}</strong><small>SUBMISSIONS</small></div><div class="admin-items"><b>Recent interest</b>${submissions.slice(0, 4).map((item) => `<span>${escapeHtml(item.email)}<small>${escapeHtml(item.status)}</small></span>`).join('') || '<small>No submissions yet.</small>'}</div>`; }
async function checkSession() { const token = localStorage.getItem('qiskitToken'); if (!token) { lockSite(); return; } try { const response = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() }); if (!response.ok) throw new Error('Session expired.'); const { user } = await response.json(); unlockSite(user.role); } catch { localStorage.removeItem('qiskitToken'); lockSite(); } }
function logout() { localStorage.removeItem('qiskitToken'); lockSite(); }
accountTrigger.addEventListener('click', () => { if (!isAuthenticated) return; if (currentUserRole === 'admin') openAdminDashboard(); else logout(); }); accountClose.addEventListener('click', closeAccountPanel); accountOverlay.addEventListener('click', (event) => { if (event.target === accountOverlay) closeAccountPanel(); }); authModes.forEach((button) => button.addEventListener('click', () => setAuthMode(button.dataset.authMode)));
document.querySelector('#logoutButton').addEventListener('click', logout);
authForm.addEventListener('submit', async (event) => { event.preventDefault(); const payload = Object.fromEntries(new FormData(authForm)); const endpoint = authMode === 'signup' ? 'signup' : 'login'; authSubmit.disabled = true; try { const response = await fetch(`${API_BASE}/auth/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Authentication failed.'); localStorage.setItem('qiskitToken', result.token); authForm.reset(); unlockSite(result.user.role); } catch (error) { showAuthError(error.message); } finally { authSubmit.disabled = false; } });
checkSession();
function updateCountdown() { const target = new Date('2026-10-02T00:00:00'); const diff = Math.max(target - new Date(), 0); document.querySelector('#days').textContent = String(Math.floor(diff / 86400000)).padStart(2, '0'); document.querySelector('#hours').textContent = String(Math.floor((diff / 3600000) % 24)).padStart(2, '0'); document.querySelector('#minutes').textContent = String(Math.floor((diff / 60000) % 60)).padStart(2, '0'); }
updateCountdown(); setInterval(updateCountdown, 60000);
const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('visible'); }), { threshold: 0.14 });
document.querySelectorAll('.reveal, .principles > div, .experience-card, .speaker-placeholder').forEach((element) => revealObserver.observe(element));
