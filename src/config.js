// Globale Konfiguration für API-Basis-URL
// Kann optional per REACT_APP_API_BASE_URL überschrieben werden.
const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const isLocalHost = ['localhost', '127.0.0.1'].includes(defaultHost);

const fallbackApiBaseUrl =
	typeof window !== 'undefined'
		? (isLocalHost ? `http://${defaultHost}:3002` : window.location.origin)
		: 'http://localhost:3002';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || fallbackApiBaseUrl;
