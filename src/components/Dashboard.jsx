import React, { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket.js';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [solPrice, setSolPrice] = useState(null);
  const [balance, setBalance] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [autoTradeStatus, setAutoTradeStatus] = useState(null);
  const [isToggling, setIsToggling] = useState(false);

  // WebSocket connection
  const { isConnected, lastMessage, error: wsError } = useWebSocket('ws://localhost:4000');

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'price_update':
          setSolPrice(lastMessage.data.price);
          setPriceHistory(prev => {
            const newHistory = [...prev, {
              price: lastMessage.data.price,
              timestamp: lastMessage.timestamp || new Date().toISOString()
            }];
            // Keep only last 50 price points
            return newHistory.slice(-50);
          });
          break;
          
        case 'balance_update':
          setBalance(lastMessage.data);
          break;
          
        case 'order_update':
          console.log('Order update received:', lastMessage.data);
          // You can add order notifications here
          break;
          
        case 'market_data':
          setMarketData(lastMessage.data);
          break;
          
        default:
          console.log('Unknown message type:', lastMessage.type);
      }
    }
  }, [lastMessage]);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch initial price
        const priceResponse = await fetch('http://localhost:4000/api/okx/price');
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          setSolPrice(priceData.price);
        }
        
        // Fetch initial balance
        const balanceResponse = await fetch('http://localhost:4000/api/okx/balance');
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setBalance(balanceData);
        }
        
        // Fetch market data
        const marketResponse = await fetch('http://localhost:4000/api/okx/market-data');
        if (marketResponse.ok) {
          const marketData = await marketResponse.json();
          setMarketData(marketData);
        }
        
        // Fetch auto-trade status
        const autoTradeResponse = await fetch('http://localhost:4000/api/autotrade/status');
        if (autoTradeResponse.ok) {
          const autoTradeData = await autoTradeResponse.json();
          setAutoTradeStatus(autoTradeData);
        }
        
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Calculate price change
  const getPriceChange = () => {
    if (priceHistory.length < 2) return { change: 0, percentage: 0, isPositive: true };
    
    const current = priceHistory[priceHistory.length - 1]?.price;
    const previous = priceHistory[0]?.price;
    
    if (!current || !previous) return { change: 0, percentage: 0, isPositive: true };
    
    const change = current - previous;
    const percentage = (change / previous) * 100;
    
    return {
      change: change.toFixed(2),
      percentage: percentage.toFixed(2),
      isPositive: change >= 0
    };
  };

  const priceChange = getPriceChange();

  // Extract balance details
  const getBalanceDetails = () => {
    if (!balance?.data?.[0]?.details) return { sol: 0, usdt: 0 };
    
    const details = balance.data[0].details;
    const sol = details.find(item => item.ccy === 'SOL');
    const usdt = details.find(item => item.ccy === 'USDT');
    
    return {
      sol: parseFloat(sol?.availBal || 0),
      usdt: parseFloat(usdt?.availBal || 0)
    };
  };

  const balanceDetails = getBalanceDetails();

  const toggleAutoTrading = async () => {
    if (isToggling) return;
    
    console.log('🔄 Toggle button clicked!');
    console.log('📊 Current auto-trade status:', autoTradeStatus);
    console.log('⏳ Is toggling:', isToggling);
    
    setIsToggling(true);
    try {
      console.log('🌐 Making API request to /api/autotrade/toggle...');
      const response = await fetch('http://localhost:4000/api/autotrade/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ API response:', result);
        
        setAutoTradeStatus(prev => {
          const newStatus = {
            ...prev,
            enabled: result.enabled
          };
          console.log('🔄 Updating auto-trade status:', newStatus);
          return newStatus;
        });
        
        console.log('🎯 Auto-trading toggled successfully!');
      } else {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        setError('Failed to toggle auto-trading');
      }
    } catch (error) {
      console.error('💥 Error toggling auto-trading:', error);
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError('Error toggling auto-trading');
    } finally {
      console.log('🏁 Toggle operation completed');
      setIsToggling(false);
    }
  };

  const debugAutoTrading = async () => {
    console.log('🔍 Debug button clicked!');
    try {
      const response = await fetch('http://localhost:4000/api/autotrade/debug');
      if (response.ok) {
        const debugInfo = await response.json();
        console.log('📊 Debug info:', debugInfo);
        alert(`Debug Info:\nSwitch exists: ${debugInfo.switchExists}\nSwitch enabled: ${debugInfo.switchData?.isEnabled}\nSwitch active: ${debugInfo.switchData?.isActive}\nAuto-trade status: ${debugInfo.autoTradeStatus}`);
      } else {
        console.error('❌ Debug request failed:', response.status);
      }
    } catch (error) {
      console.error('💥 Debug error:', error);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading real-time data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      {/* Connection Status */}
      <div className="mb-6">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          {isConnected ? 'Live Data Connected' : 'Connecting...'}
        </div>
        {wsError && (
          <p className="text-red-400 text-sm mt-1">WebSocket Error: {wsError}</p>
        )}
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">SOLANA Trading Dashboard</h1>
        <p className="text-purple-200">Real-time market data and portfolio tracking</p>
      </div>

      {/* Price Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">SOL Price</h2>
            <div className="text-4xl font-bold text-green-400">
              {solPrice ? formatCurrency(solPrice.price) : '---'}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold ${
              priceChange.isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {priceChange.isPositive ? '+' : ''}{priceChange.change} ({priceChange.percentage}%)
            </div>
            <div className="text-purple-200 text-sm">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Trade Toggle */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Auto-Trading Bot</h2>
            <p className="text-purple-200">
              {autoTradeStatus?.enabled 
                ? '🟢 Bot is actively trading based on candle analysis' 
                : '🔴 Bot is paused - no automatic trades'
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white font-medium">
                {autoTradeStatus?.strategy || 'Candle-based'}
              </p>
              <p className="text-purple-200 text-sm">
                {autoTradeStatus?.interval || '60s intervals'}
              </p>
            </div>
            
            <button
              onClick={toggleAutoTrading}
              disabled={isToggling}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                autoTradeStatus?.enabled 
                  ? 'bg-green-600' 
                  : 'bg-gray-600'
              } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  autoTradeStatus?.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            {isToggling && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            )}
            
            {/* Debug Button */}
            <button
              onClick={debugAutoTrading}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
              title="Debug auto-trading switch state"
            >
              🔍 Debug
            </button>
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">SOL Balance</h3>
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {balanceDetails.sol.toFixed(4)} SOL
          </div>
          <div className="text-purple-200">
            ≈ {formatCurrency((balanceDetails.sol * (solPrice?.price || 0)))} USD
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">USDT Balance</h3>
          <div className="text-3xl font-bold text-green-400 mb-2">
            {formatCurrency(balanceDetails.usdt)} USDT
          </div>
          <div className="text-green-200">
            Available for trading
          </div>
        </div>
      </div>

      {/* Total Portfolio Value */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Total Portfolio Value</h3>
        <div className="text-3xl font-bold text-yellow-400">
          {formatCurrency((balanceDetails.sol * (solPrice?.price || 0)) + balanceDetails.usdt)} USD
        </div>
        <div className="text-yellow-200 text-sm mt-2">
          SOL: {formatCurrency((balanceDetails.sol * (solPrice?.price || 0)))} | USDT: {formatCurrency(balanceDetails.usdt)}
        </div>
      </div>

      {/* Price Chart Placeholder */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mt-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Price Movement</h3>
        <div className="h-32 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
          <p className="text-purple-200">Real-time price chart coming soon...</p>
        </div>
        <div className="text-sm text-purple-200 mt-2">
          {priceHistory.length} price points tracked
        </div>
      </div>

      {/* Market Data */}
      {marketData && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Market Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-purple-200 text-sm">24h Volume</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(marketData.volume24h)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-purple-200 text-sm">24h High</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(marketData.high24h)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-purple-200 text-sm">24h Low</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(marketData.low24h)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-purple-200 text-sm">Market Cap</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(marketData.marketCap)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl p-4 mt-6 border border-red-500/30">
          <p className="text-red-200">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 