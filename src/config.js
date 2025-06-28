// Backend configuration - handles different environments
const isDevelopment = import.meta.env.DEV;
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

// Use environment variables if available, otherwise fall back to defaults
const getBackendUrl = () => {
  // Check for VITE_BACKEND_URI environment variable first
  if (import.meta.env.VITE_BACKEND_URI) {
    return import.meta.env.VITE_BACKEND_URI;
  }
  
  // Use production URL if on Vercel
  if (isVercel) {
    return 'https://trading-view-backend.onrender.com';
  }
  
  // Default to localhost for development
  return 'http://localhost:4000';
};

const getWebSocketUrl = () => {
  // Check for VITE_WEBSOCKET_URI environment variable first
  if (import.meta.env.VITE_WEBSOCKET_URI) {
    return import.meta.env.VITE_WEBSOCKET_URI;
  }
  
  // Use production WebSocket URL if on Vercel
  if (isVercel) {
    return 'wss://trading-view-backend.onrender.com';
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