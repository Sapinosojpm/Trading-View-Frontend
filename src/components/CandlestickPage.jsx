import React, { useState } from 'react';
import CandlestickChart from './CandlestickChart.jsx';
import useWebSocket from '../hooks/useWebSocket.js';
import { wsUri } from '../config.js';
import { 
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const CandlestickPage = () => {
  const [timeframe, setTimeframe] = useState('1m');
  const [maxCandles, setMaxCandles] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  
  // WebSocket connection
  const { isConnected, lastMessage } = useWebSocket(wsUri);

  const timeframes = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' }
  ];

  const candleLimits = [
    { value: 50, label: '50 Candles' },
    { value: 100, label: '100 Candles' },
    { value: 200, label: '200 Candles' },
    { value: 500, label: '500 Candles' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/price-movement"
            className="flex items-center space-x-2 text-purple-200 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Price Movement</span>
          </Link>
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">SOL/USDT Candlestick Chart</h1>
          <p className="text-purple-200">Professional trading chart with real-time updates</p>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-purple-200">
            {isConnected ? 'Live Data' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-purple-200" />
              <label className="text-white text-sm font-medium">Timeframe:</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 text-sm"
              >
                {timeframes.map(tf => (
                  <option key={tf.value} value={tf.value}>
                    {tf.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5 text-purple-200" />
              <label className="text-white text-sm font-medium">Candles:</label>
              <select
                value={maxCandles}
                onChange={(e) => setMaxCandles(parseInt(e.target.value))}
                className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 text-sm"
              >
                {candleLimits.map(limit => (
                  <option key={limit.value} value={limit.value}>
                    {limit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-white text-sm">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded border-white/30 bg-white/20"
              />
              <span>Show Grid</span>
            </label>

            <label className="flex items-center space-x-2 text-white text-sm">
              <input
                type="checkbox"
                checked={showVolume}
                onChange={(e) => setShowVolume(e.target.checked)}
                className="rounded border-white/30 bg-white/20"
              />
              <span>Show Volume</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-3">
          <CandlestickChart 
            timeframe={timeframe} 
            maxCandles={maxCandles}
            showGrid={showGrid}
            showVolume={showVolume}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Market Info */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Market Info</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-purple-200 text-sm">Symbol</span>
                <span className="text-white font-medium">SOL/USDT</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-purple-200 text-sm">Exchange</span>
                <span className="text-white font-medium">OKX</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-purple-200 text-sm">Timeframe</span>
                <span className="text-white font-medium">{timeframe.toUpperCase()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-purple-200 text-sm">Candles</span>
                <span className="text-white font-medium">{maxCandles}</span>
              </div>
            </div>
          </div>

          {/* Chart Controls */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Chart Controls</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-purple-200 text-sm block mb-2">Quick Timeframes</label>
                <div className="grid grid-cols-2 gap-2">
                  {timeframes.slice(0, 4).map(tf => (
                    <button
                      key={tf.value}
                      onClick={() => setTimeframe(tf.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        timeframe === tf.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/10 text-purple-200 hover:bg-white/20'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-purple-200 text-sm block mb-2">Candle Count</label>
                <div className="grid grid-cols-2 gap-2">
                  {candleLimits.slice(0, 2).map(limit => (
                    <button
                      key={limit.value}
                      onClick={() => setMaxCandles(limit.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        maxCandles === limit.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/10 text-purple-200 hover:bg-white/20'
                      }`}
                    >
                      {limit.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trading Tips */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Trading Tips</h3>
            
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 font-medium">Bullish Candle</p>
                <p className="text-green-200 text-xs">Close &gt; Open (Green)</p>
              </div>
              
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 font-medium">Bearish Candle</p>
                <p className="text-red-200 text-xs">Close &lt; Open (Red)</p>
              </div>
              
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 font-medium">Wick Length</p>
                <p className="text-blue-200 text-xs">Shows price volatility</p>
              </div>
              
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 font-medium">Body Size</p>
                <p className="text-yellow-200 text-xs">Indicates momentum strength</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
        <div className="text-center text-sm text-purple-200">
          <p>Real-time SOL/USDT candlestick data from OKX Exchange</p>
          <p className="mt-1">Use this chart for technical analysis and trading decisions</p>
        </div>
      </div>
    </div>
  );
};

export default CandlestickPage; 