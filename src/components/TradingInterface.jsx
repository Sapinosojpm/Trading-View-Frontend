import React, { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket.js';
import { backendUri, wsUri, apiEndpoints } from '../config.js';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  PlayIcon,
  StopIcon,
  Cog6ToothIcon,
  SparklesIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const TradingInterface = () => {
  const [isTrading, setIsTrading] = useState(false);
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [balance, setBalance] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [marketData, setMarketData] = useState({
    price: 0,
    change: 0,
    changePercent: 0
  });
  const [tradingSettings, setTradingSettings] = useState({
    maxTradeAmount: 100,
    stopLoss: 5,
    takeProfit: 10,
    autoTrading: false
  });
  const [popularPairs, setPopularPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [recentTrades, setRecentTrades] = useState([]);

  // WebSocket connection
  const { isConnected, lastMessage } = useWebSocket(wsUri);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'price_update':
          setCurrentPrice(lastMessage.data.price);
          break;
          
        case 'balance_update':
          setBalance(lastMessage.data);
          break;
          
        case 'order_update':
          setRecentOrders(prev => [lastMessage.data, ...prev.slice(0, 4)]);
          setMessage(`Order ${lastMessage.data.status}: ${lastMessage.data.side} ${lastMessage.data.amount} SOL`);
          setTimeout(() => setMessage(''), 5000);
          break;
          
        default:
          break;
      }
    }
  }, [lastMessage]);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [priceResponse, balanceResponse] = await Promise.all([
          fetch(apiEndpoints.price),
          fetch(apiEndpoints.balance)
        ]);
        
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          setCurrentPrice(priceData.price);
        }
        
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setBalance(balanceData);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || (orderType === 'limit' && !price)) {
      setMessage('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${backendUri}/api/okx/trade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          side,
          amount: parseFloat(amount),
          symbol: 'SOL-USDT',
          ...(orderType === 'limit' && { price: parseFloat(price) })
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✅ ${result.message}`);
        setAmount('');
        setPrice('');
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setMessage('❌ Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

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

  const calculateOrderValue = () => {
    if (!amount || !currentPrice) return 0;
    return parseFloat(amount) * currentPrice;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num);
  };

  const getChangeColor = (change) => {
    const changeNum = parseFloat(change);
    if (changeNum > 0) return 'text-green-500';
    if (changeNum < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const toggleTrading = () => {
    setIsTrading(!isTrading);
    // Here you would start/stop the trading bot
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <SparklesIcon className="w-8 h-8 text-purple-600" />
              <h1 className="text-4xl font-bold text-gray-900">SOLANA Trading Interface</h1>
            </div>
            <p className="text-gray-600 text-lg">Loading real market data from OKX...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Market Data Error</h1>
              <p className="text-red-100">{error}</p>
              <button 
                onClick={() => {
                  // Implement retry logic
                }}
                className="mt-4 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                Retry Connection
              </button>
            </div>
          </div>
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
          {isConnected ? 'Live Trading Connected' : 'Connecting...'}
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">SOLANA Trading Interface</h1>
        <p className="text-purple-200">Real-time trading with live market data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trading Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Place Order</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Type */}
            <div>
              <label className="block text-white font-medium mb-2">Order Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="market"
                    checked={orderType === 'market'}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-white">Market</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="limit"
                    checked={orderType === 'limit'}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-white">Limit</span>
                </label>
              </div>
            </div>

            {/* Buy/Sell Toggle */}
            <div>
              <label className="block text-white font-medium mb-2">Side</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="buy"
                    checked={side === 'buy'}
                    onChange={(e) => setSide(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-green-400 font-medium">Buy</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="sell"
                    checked={side === 'sell'}
                    onChange={(e) => setSide(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-red-400 font-medium">Sell</span>
                </label>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-white font-medium mb-2">
                Amount (SOL)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0000"
                step="0.0001"
                min="0.001"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              {amount && currentPrice && (
                <p className="text-purple-200 text-sm mt-1">
                  ≈ ${calculateOrderValue().toFixed(2)} USDT
                </p>
              )}
            </div>

            {/* Price (for limit orders) */}
            {orderType === 'limit' && (
              <div>
                <label className="block text-white font-medium mb-2">
                  Price (USDT)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={currentPrice ? currentPrice.toFixed(2) : "0.00"}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                side === 'buy'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Placing Order...
                </span>
              ) : (
                `${side.toUpperCase()} SOL`
              )}
            </button>
          </form>

          {/* Message Display */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg ${
              message.includes('✅') 
                ? 'bg-green-500/20 border border-green-500/30 text-green-200'
                : 'bg-red-500/20 border border-red-500/30 text-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Market Info & Balance */}
        <div className="space-y-6">
          {/* Current Price */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Current Market</h3>
            <div className="text-3xl font-bold text-green-400 mb-2">
              ${currentPrice ? currentPrice.toFixed(2) : '---'}
            </div>
            <p className="text-purple-200">SOL/USDT</p>
          </div>

          {/* Balance */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Available Balance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-purple-200">SOL:</span>
                <span className="text-purple-400 font-medium">
                  {balanceDetails.sol.toFixed(4)} SOL
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-200">USDT:</span>
                <span className="text-green-400 font-medium">
                  ${balanceDetails.usdt.toFixed(2)} USDT
                </span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Orders</h3>
            {recentOrders.length === 0 ? (
              <p className="text-purple-200">No recent orders</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded">
                    <div>
                      <span className={`font-medium ${
                        order.side === 'buy' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {order.side.toUpperCase()}
                      </span>
                      <span className="text-white ml-2">{order.amount} SOL</span>
                    </div>
                    <span className="text-purple-200 text-sm">{order.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingInterface; 