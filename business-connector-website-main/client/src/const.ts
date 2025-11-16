// src/const.ts - Fixed Invalid URL and added title

export const API_BASE_URL = process.env.VITE_API_URL || '/api'; // Fixed: Env or relative - no localhost

export const APP_TITLE = process.env.VITE_APP_TITLE || 'Business Conector - Real Estate Leads'; // For browser title

export const GHL_API_KEY = process.env.GHL_API_KEY; // For leads

export const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY; // For listings

export const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_KEY; // For maps