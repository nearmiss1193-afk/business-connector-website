// src/const.ts - Vite-friendly env accessors for client

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'Central Florida Homes';

export const APP_LOGO = import.meta.env.VITE_APP_LOGO || "https://placehold.co/128x128/2563eb/ffffff?text=CFH&font=montserrat";

export const GHL_API_KEY = import.meta.env.VITE_GHL_API_KEY;

export const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

export const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

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