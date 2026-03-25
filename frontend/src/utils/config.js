// Centralized API configuration for the frontend
// Production (Unified Deployment): Set VITE_API_URL to '/api' or your backend URL
// Development: Defaults to http://localhost:5001

export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5001');
