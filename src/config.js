// Globale Konfiguration für API-Basis-URL
// Kann optional per REACT_APP_API_BASE_URL überschrieben werden.
const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || `http://${defaultHost}:3002`;
