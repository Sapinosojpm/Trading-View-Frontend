import React, { useState } from 'react';
import TradingViewChart from './TradingViewChart.jsx';
import { useWebSocketContext } from '../contexts/WebSocketContext';
import { 
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  MagnifyingGlassIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const TradingViewPage = () => {
  const [timeframe, setTimeframe] = useState('1m');
  const [maxCandles, setMaxCandles] = useState(200);
  const [showVolume, setShowVolume] = useState(true);
  const [showIndicators, setShowIndicators] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoom, setZoom] = useState(1);
  
  // Shared WebSocket connection
  const { isConnected, lastMessage } = useWebSocketContext();

  const timeframes = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' }
  ];

  const candleLimits = [
    { value: 100, label: '100 Candles' },
    { value: 200, label: '200 Candles' },
    { value: 500, label: '500 Candles' },
    { value: 1000, label: '1000 Candles' }
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
          <h1 className="text-3xl font-bold text-white mb-2">TradingView Chart</h1>
          <p className="text-purple-200">Professional trading chart with advanced features</p>
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

      {/* Advanced Controls */}
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

            <div className="flex items-center space-x-2">
              <label className="text-white text-sm">Zoom:</label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-white text-sm w-8">{zoom.toFixed(1)}x</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isPlaying 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={() => setZoom(1)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              <span>Reset Zoom</span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-6">
          <label className="flex items-center space-x-2 text-white text-sm">
            <input
              type="checkbox"
              checked={showVolume}
              onChange={(e) => setShowVolume(e.target.checked)}
              className="rounded border-white/30 bg-white/20"
            />
            <span>Show Volume</span>
          </label>

          <label className="flex items-center space-x-2 text-white text-sm">
            <input
              type="checkbox"
              checked={showIndicators}
              onChange={(e) => setShowIndicators(e.target.checked)}
              className="rounded border-white/30 bg-white/20"
            />
            <span>Show Indicators</span>
          </label>
        </div>
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-3">
          <TradingViewChart 
            timeframe={timeframe} 
            maxCandles={maxCandles}
            showVolume={showVolume}
            showIndicators={showIndicators}
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

              <div className="flex justify-between">
                <span className="text-purple-200 text-sm">Zoom Level</span>
                <span className="text-white font-medium">{zoom.toFixed(1)}x</span>
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

          {/* Technical Indicators */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Technical Indicators</h3>
            
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 font-medium">SMA 20</p>
                <p className="text-red-200 text-xs">Simple Moving Average (20 periods)</p>
              </div>
              
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-cyan-400 font-medium">EMA 12</p>
                <p className="text-cyan-200 text-xs">Exponential Moving Average (12 periods)</p>
              </div>
              
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 font-medium">EMA 26</p>
                <p className="text-blue-200 text-xs">Exponential Moving Average (26 periods)</p>
              </div>
              
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 font-medium">Volume</p>
                <p className="text-green-200 text-xs">Trading volume bars</p>
              </div>
            </div>
          </div>

          {/* Chart Features */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Chart Features</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <ArrowsPointingOutIcon className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Zoom & Pan</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MagnifyingGlassIcon className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400">Interactive Tooltips</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <PlayIcon className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400">Real-time Updates</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400">Multiple Timeframes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
        <div className="text-center text-sm text-purple-200">
          <p>TradingView-style chart with professional features and real-time SOL/USDT data</p>
          <p className="mt-1">Use mouse wheel to zoom, drag to pan, and hover for detailed information</p>
        </div>
      </div>
    </div>
  );
};

export default TradingViewPage;
