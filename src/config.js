// Backend configuration - handles different environments
const isDevelopment = import.meta.env.DEV;
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

// Use environment variables if available, otherwise fall back to defaults
const getBackendUrl = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // Use production URL if on Vercel
  if (isVercel) {
    // For now, let's use a placeholder that you can replace with your actual backend URL
    // You can either set VITE_BACKEND_URL in Vercel environment variables
    // or replace this with your actual backend domain
    return 'https://trading-view-backend.onrender.com'; // Replace with your actual backend domain
  }
  
  // Default to localhost for development
  return 'http://localhost:4000';
};

const getWebSocketUrl = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_WEBSOCKET_URL) {
    return import.meta.env.VITE_WEBSOCKET_URL;
  }
  
  // Use production WebSocket URL if on Vercel
  if (isVercel) {
    // For now, let's use a placeholder that you can replace with your actual WebSocket URL
    // You can either set VITE_WEBSOCKET_URL in Vercel environment variables
    // or replace this with your actual WebSocket domain
    return 'wss://your-backend-domain.com'; // Replace with your actual backend domain
  }
  
  // Default to localhost for development
  return 'ws://localhost:4000';
};

export const backendUri = getBackendUrl();
export const wsUri = getWebSocketUrl();

// API endpoints
export const apiEndpoints = {
  price: `${backendUri}/api/okx/price`,
  balance: `${backendUri}/api/okx/balance`,
  marketData: `${backendUri}/api/okx/market-data`,
  autoTradeStatus: `${backendUri}/api/autotrade/status`,
  autoTradeToggle: `${backendUri}/api/autotrade/toggle`,
  autoTradeDebug: `${backendUri}/api/autotrade/debug`,
}; 