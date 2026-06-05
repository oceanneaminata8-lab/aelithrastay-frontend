// Check if running in a safe browser context and look directly at the hostname
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.')) {
      return 'http://localhost:8000/api';
    }
  }
  // Change this to match your EXACT live dashboard string!
  return 'https://aelithrastay-backend.onrender.com/api';
};

export const API_BASE_URL = getBaseUrl();