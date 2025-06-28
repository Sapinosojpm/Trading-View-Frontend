import React, { useState, useEffect, useRef } from 'react';
import useWebSocket from '../hooks/useWebSocket.js';
import CandlestickChart from './CandlestickChart.jsx';
import { Link } from 'react-router-dom';
import { wsUri } from '../config.js';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BellIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PauseIcon,
  PlayIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const PriceMovement = () => {
  const [priceHistory, setPriceHistory] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [movementAnalysis, setMovementAnalysis] = useState({});
  const [isTracking, setIsTracking] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(5); // 5% change
  const [timeframe, setTimeframe] = useState('1m'); // 1m, 5m, 15m, 1h
  const [movementLog, setMovementLog] = useState([]);
  const [volatility, setVolatility] = useState(0);
  const [trend, setTrend] = useState('neutral');
  const [maxHistoryLength] = useState(100);

  // WebSocket connection
  const { isConnected, lastMessage } = useWebSocket(wsUri);
  const canvasRef = useRef(null);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'price_update') {
      const newPrice = lastMessage.data.price;
      const timestamp = lastMessage.timestamp || new Date().toISOString();
      
      setCurrentPrice(newPrice);
      
      if (isTracking) {
        setPriceHistory(prev => {
          const newHistory = [...prev, { price: newPrice, timestamp }];
          // Keep only the last maxHistoryLength points
          return newHistory.slice(-maxHistoryLength);
        });
      }
    }
  }, [lastMessage, isTracking, maxHistoryLength]);

  // Analyze price movements
  useEffect(() => {
    if (priceHistory.length < 2) return;

    const analysis = analyzePriceMovement(priceHistory);
    setMovementAnalysis(analysis);
    setVolatility(analysis.volatility);
    setTrend(analysis.trend);

    // Check for significant movements
    if (Math.abs(analysis.percentageChange) >= alertThreshold) {
      const alert = {
        id: Date.now(),
        type: analysis.percentageChange > 0 ? 'bullish' : 'bearish',
        percentage: analysis.percentageChange,
        price: currentPrice,
        timestamp: new Date().toISOString(),
        message: `${analysis.percentageChange > 0 ? '📈' : '📉'} ${Math.abs(analysis.percentageChange).toFixed(2)}% ${analysis.percentageChange > 0 ? 'increase' : 'decrease'} in ${timeframe}`
      };

      setPriceAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
      setMovementLog(prev => [alert, ...prev.slice(0, 49)]); // Keep last 50 movements
    }
  }, [priceHistory, alertThreshold, timeframe, currentPrice]);

  // Draw price chart
  useEffect(() => {
    if (!canvasRef.current || priceHistory.length < 2) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate price range
    const prices = priceHistory.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw price line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();

    priceHistory.forEach((point, index) => {
      const x = (index / (priceHistory.length - 1)) * width;
      const y = height - ((point.price - minPrice) / priceRange) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw price points
    ctx.fillStyle = '#10b981';
    priceHistory.forEach((point, index) => {
      const x = (index / (priceHistory.length - 1)) * width;
      const y = height - ((point.price - minPrice) / priceRange) * height;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

  }, [priceHistory]);

  const analyzePriceMovement = (history) => {
    if (history.length < 2) return {};

    const recent = history.slice(-10); // Last 10 points
    const older = history.slice(-20, -10); // Previous 10 points

    const recentAvg = recent.reduce((sum, p) => sum + p.price, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p.price, 0) / older.length;

    const percentageChange = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    // Calculate volatility (standard deviation)
    const prices = history.map(p => p.price);
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance);

    // Determine trend
    let trend = 'neutral';
    if (percentageChange > 2) trend = 'bullish';
    else if (percentageChange < -2) trend = 'bearish';

    return {
      percentageChange: percentageChange.toFixed(2),
      volatility: volatility.toFixed(2),
      trend,
      recentAvg: recentAvg.toFixed(2),
      olderAvg: olderAvg.toFixed(2),
      priceRange: (Math.max(...prices) - Math.min(...prices)).toFixed(2)
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const clearAlerts = () => {
    setPriceAlerts([]);
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Price Movement Tracker</h1>
        <p className="text-purple-200">Real-time SOL price analysis and alerts</p>
      </div>

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
          {isConnected ? 'Live Tracking Active' : 'Connecting...'}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTracking}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                isTracking 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isTracking ? <PauseIcon className="w-4 h-4 mr-2" /> : <PlayIcon className="w-4 h-4 mr-2" />}
              {isTracking ? 'Pause Tracking' : 'Resume Tracking'}
            </button>

            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2"
            >
              <option value="1m">1 Minute</option>
              <option value="5m">5 Minutes</option>
              <option value="15m">15 Minutes</option>
              <option value="1h">1 Hour</option>
            </select>

            <div className="flex items-center space-x-2">
              <label className="text-white text-sm">Alert Threshold:</label>
              <input
                type="number"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(parseFloat(e.target.value))}
                className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 w-20"
                min="0.1"
                max="50"
                step="0.1"
              />
              <span className="text-white text-sm">%</span>
            </div>
          </div>

          <button
            onClick={clearAlerts}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Clear Alerts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Price and Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Price */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Current SOL Price</h2>
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                trend === 'bullish' ? 'bg-green-100 text-green-800' :
                trend === 'bearish' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {trend === 'bullish' ? <ArrowTrendingUpIcon className="w-4 h-4 mr-1" /> :
                 trend === 'bearish' ? <ArrowTrendingDownIcon className="w-4 h-4 mr-1" /> :
                 <ChartBarIcon className="w-4 h-4 mr-1" />}
                {trend.toUpperCase()}
              </div>
            </div>
            
            <div className="text-4xl font-bold text-green-400 mb-4">
              {currentPrice ? formatCurrency(currentPrice) : '---'}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-purple-200 text-sm">Change</p>
                <p className={`text-lg font-bold ${
                  movementAnalysis.percentageChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {movementAnalysis.percentageChange ? `${movementAnalysis.percentageChange > 0 ? '+' : ''}${movementAnalysis.percentageChange}%` : '---'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-purple-200 text-sm">Volatility</p>
                <p className="text-lg font-bold text-yellow-400">
                  {volatility ? `$${volatility}` : '---'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-purple-200 text-sm">Price Range</p>
                <p className="text-lg font-bold text-blue-400">
                  {movementAnalysis.priceRange ? `$${movementAnalysis.priceRange}` : '---'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-purple-200 text-sm">Data Points</p>
                <p className="text-lg font-bold text-purple-400">
                  {priceHistory.length}
                </p>
              </div>
            </div>
          </div>

          {/* Candlestick Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Candlestick Chart</h3>
              <div className="flex items-center space-x-2">
                <Link
                  to="/candlestick"
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  <span>Full Chart</span>
                </Link>
                <Link
                  to="/tradingview"
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  <ChartBarIcon className="w-4 h-4" />
                  <span>TradingView</span>
                </Link>
              </div>
            </div>
            <CandlestickChart timeframe={timeframe} maxCandles={50} />
          </div>
        </div>

        {/* Alerts and Logs */}
        <div className="space-y-6">
          {/* Price Alerts */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Price Alerts</h3>
              <BellIcon className="w-5 h-5 text-yellow-400" />
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {priceAlerts.length === 0 ? (
                <p className="text-purple-200 text-sm">No alerts triggered yet</p>
              ) : (
                priceAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.type === 'bullish' 
                        ? 'bg-green-500/20 border-green-500/30' 
                        : 'bg-red-500/20 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">
                        {alert.message}
                      </span>
                      <span className="text-xs text-gray-300">
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-300 mt-1">
                      Price: {formatCurrency(alert.price)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Movement Log */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Movement Log</h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {movementLog.length === 0 ? (
                <p className="text-purple-200 text-sm">No movements logged yet</p>
              ) : (
                movementLog.map(movement => (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between p-2 rounded bg-white/5"
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${
                        movement.type === 'bullish' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {movement.type === 'bullish' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                      </span>
                      <span className="text-sm text-white">
                        {Math.abs(movement.percentage).toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-300">
                      {formatTime(movement.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Movement Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-purple-200 text-sm">Total Movements</p>
            <p className="text-2xl font-bold text-white">{movementLog.length}</p>
          </div>
          <div className="text-center">
            <p className="text-purple-200 text-sm">Bullish Alerts</p>
            <p className="text-2xl font-bold text-green-400">
              {movementLog.filter(m => m.type === 'bullish').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-purple-200 text-sm">Bearish Alerts</p>
            <p className="text-2xl font-bold text-red-400">
              {movementLog.filter(m => m.type === 'bearish').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-purple-200 text-sm">Avg Volatility</p>
            <p className="text-2xl font-bold text-yellow-400">
              {volatility ? `$${parseFloat(volatility).toFixed(2)}` : '---'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceMovement; 