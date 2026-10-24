const isLocalDevelopment = ['localhost', '127.0.0.1'].includes(window.location.hostname);

// Render routes are mounted under /api; keep localhost for local development.
window.API_BASE_URL = isLocalDevelopment
  ? 'http://localhost:4000/api'
  : 'https://ibm-qiskit-event-2026.onrender.com/api';
