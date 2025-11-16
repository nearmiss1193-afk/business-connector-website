// src/const.ts - Fixed Invalid URL and added title

export const API_BASE_URL = process.env.VITE_API_URL || '/api'; // Fixed: Env or relative - no localhost

export const APP_TITLE = process.env.VITE_APP_TITLE || 'Business Conector - Real Estate Leads'; // For browser title

export const GHL_API_KEY = process.env.GHL_API_KEY; // For leads

export const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY; // For listings

export const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_KEY; // For maps

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || 'https://app.gohighlevel.com';
  const appId = import.meta.env.VITE_APP_ID || '';
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};