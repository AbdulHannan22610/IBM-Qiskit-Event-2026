// Use the local backend when running on localhost/file, otherwise the deployed Railway API URL.
window.API_BASE_URL = (['localhost', '127.0.0.1', ''].includes(location.hostname))
  ? 'http://localhost:4000/api'
  : 'https://ibm-qiskit-event-2026-production.up.railway.app/api';
