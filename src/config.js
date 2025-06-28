// Backend configuration
export const backendUri = 'http://localhost:4000';
export const wsUri = 'ws://localhost:4000';

// API endpoints
export const apiEndpoints = {
  price: `${backendUri}/api/okx/price`,
  balance: `${backendUri}/api/okx/balance`,
  marketData: `${backendUri}/api/okx/market-data`,
  autoTradeStatus: `${backendUri}/api/autotrade/status`,
  autoTradeToggle: `${backendUri}/api/autotrade/toggle`,
  autoTradeDebug: `${backendUri}/api/autotrade/debug`,
}; 