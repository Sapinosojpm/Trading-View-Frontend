import React, { useEffect, useRef, useState } from 'react';
import useWebSocket from '../hooks/useWebSocket.js';
import { wsUri, backendUri } from '../config.js';
import { 
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

const TradingViewChart = ({ 
  timeframe = '1m', 
  maxCandles = 200,
  showVolume = true,
  showIndicators = true 
}) => {
  const canvasRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const [hoveredCandle, setHoveredCandle] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // WebSocket connection
  const { isConnected, lastMessage } = useWebSocket(wsUri);

  // Fetch initial candlestick data
  useEffect(() => {
    const fetchCandles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${backendUri}/api/okx/price-movement?timeframe=${timeframe}&limit=${maxCandles}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.recentCandles && data.recentCandles.length > 0) {
            setCandles(data.recentCandles);
          }
        } else {
          setError('Failed to fetch candlestick data');
        }
      } catch (err) {
        console.error('Error fetching candles:', err);
        setError('Error loading candlestick data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandles();
  }, [timeframe, maxCandles]);

  // Handle WebSocket price updates
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'price_update' && isPlaying) {
      const newPrice = lastMessage.data.price;
      const timestamp = lastMessage.timestamp || new Date().toISOString();
      
      setCurrentPrice(newPrice);
      updateCandles(newPrice, timestamp);
    }
  }, [lastMessage, isPlaying]);

  const updateCandles = (price, timestamp) => {
    setCandles(prevCandles => {
      if (prevCandles.length === 0) {
        return [{
          timestamp: new Date(timestamp).getTime(),
          open: price,
          high: price,
          low: price,
          close: price,
          volume: Math.random() * 1000 + 500
        }];
      }

      const now = new Date(timestamp).getTime();
      const lastCandle = prevCandles[prevCandles.length - 1];
      const candleTime = new Date(lastCandle.timestamp).getTime();
      
      const timeframeMs = getTimeframeMs(timeframe);
      const shouldCreateNewCandle = (now - candleTime) >= timeframeMs;
      
      if (shouldCreateNewCandle) {
        const newCandle = {
          timestamp: now,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: Math.random() * 1000 + 500
        };
        
        const updatedCandles = [...prevCandles, newCandle];
        return updatedCandles.slice(-maxCandles);
      } else {
        const updatedCandles = [...prevCandles];
        const currentCandle = updatedCandles[updatedCandles.length - 1];
        
        currentCandle.high = Math.max(currentCandle.high, price);
        currentCandle.low = Math.min(currentCandle.low, price);
        currentCandle.close = price;
        currentCandle.volume += Math.random() * 100 + 50;
        
        return updatedCandles;
      }
    });
  };

  const getTimeframeMs = (tf) => {
    switch (tf) {
      case '1m': return 60 * 1000;
      case '5m': return 5 * 60 * 1000;
      case '15m': return 15 * 60 * 1000;
      case '1h': return 60 * 60 * 1000;
      case '4h': return 4 * 60 * 60 * 1000;
      case '1d': return 24 * 60 * 60 * 1000;
      default: return 60 * 1000;
    }
  };

  // Calculate technical indicators
  const calculateSMA = (prices, period) => {
    if (prices.length < period) return [];
    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  };

  const calculateEMA = (prices, period) => {
    if (prices.length < period) return [];
    const ema = [];
    const multiplier = 2 / (period + 1);
    
    // First EMA is SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += prices[i];
    }
    ema.push(sum / period);
    
    // Calculate EMA
    for (let i = period; i < prices.length; i++) {
      const newEMA = (prices[i] * multiplier) + (ema[ema.length - 1] * (1 - multiplier));
      ema.push(newEMA);
    }
    
    return ema;
  };

  // Draw TradingView-style chart
  useEffect(() => {
    if (!canvasRef.current || candles.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate visible candles based on zoom and pan
    const visibleCandles = Math.floor(candles.length / zoom);
    const startIndex = Math.max(0, Math.floor(panOffset));
    const endIndex = Math.min(candles.length, startIndex + visibleCandles);
    const visibleData = candles.slice(startIndex, endIndex);

    if (visibleData.length === 0) return;

    // Calculate price range
    const prices = visibleData.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Add padding
    const padding = priceRange * 0.1;
    const chartMin = minPrice - padding;
    const chartMax = maxPrice + padding;
    const chartRange = chartMax - chartMin;

    // Calculate dimensions
    const chartHeight = showVolume ? height * 0.7 : height;
    const volumeHeight = showVolume ? height * 0.2 : 0;
    const margin = 60;
    const chartWidth = width - margin * 2;
    const candleWidth = Math.max(1, chartWidth / visibleData.length - 1);
    const candleSpacing = chartWidth / visibleData.length;

    // Draw background
    drawBackground(ctx, width, height);

    // Draw grid
    drawGrid(ctx, width, chartHeight, margin, chartMin, chartMax);

    // Draw price labels
    drawPriceLabels(ctx, width, chartHeight, margin, chartMin, chartMax);

    // Draw time labels
    drawTimeLabels(ctx, width, chartHeight, margin, visibleData);

    // Calculate and draw indicators
    if (showIndicators) {
      const prices = visibleData.map(c => c.close);
      const sma20 = calculateSMA(prices, 20);
      const ema12 = calculateEMA(prices, 12);
      const ema26 = calculateEMA(prices, 26);

      // Draw SMA 20
      if (sma20.length > 0) {
        drawLine(ctx, visibleData.slice(19), sma20, margin, chartHeight, chartMin, chartRange, '#ff6b6b', 2);
      }

      // Draw EMA 12
      if (ema12.length > 0) {
        drawLine(ctx, visibleData.slice(11), ema12, margin, chartHeight, chartMin, chartRange, '#4ecdc4', 2);
      }

      // Draw EMA 26
      if (ema26.length > 0) {
        drawLine(ctx, visibleData.slice(25), ema26, margin, chartHeight, chartMin, chartRange, '#45b7d1', 2);
      }
    }

    // Draw candlesticks
    visibleData.forEach((candle, index) => {
      const x = margin + index * candleSpacing + candleSpacing / 2;
      
      // Calculate y positions
      const openY = chartHeight - margin - ((candle.open - chartMin) / chartRange) * (chartHeight - margin * 2);
      const closeY = chartHeight - margin - ((candle.close - chartMin) / chartRange) * (chartHeight - margin * 2);
      const highY = chartHeight - margin - ((candle.high - chartMin) / chartRange) * (chartHeight - margin * 2);
      const lowY = chartHeight - margin - ((candle.low - chartMin) / chartRange) * (chartHeight - margin * 2);

      // Determine candle color
      const isBullish = candle.close >= candle.open;
      const color = isBullish ? '#26a69a' : '#ef5350';
      const fillColor = isBullish ? '#26a69a' : '#ef5350';

      // Draw wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body
      const bodyTop = Math.min(openY, closeY);
      const bodyBottom = Math.max(openY, closeY);
      const bodyHeight = Math.max(1, bodyBottom - bodyTop);

      ctx.fillStyle = fillColor;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

      // Draw body border
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });

    // Draw volume bars
    if (showVolume && volumeHeight > 0) {
      drawVolumeBars(ctx, width, chartHeight, volumeHeight, margin, visibleData);
    }

    // Draw current price line
    if (currentPrice) {
      const currentY = chartHeight - margin - ((currentPrice - chartMin) / chartRange) * (chartHeight - margin * 2);
      
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(margin, currentY);
      ctx.lineTo(width - margin, currentY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw price label
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`$${currentPrice.toFixed(2)}`, width - 10, currentY - 5);
    }

  }, [candles, currentPrice, zoom, panOffset, showVolume, showIndicators]);

  const drawBackground = (ctx, width, height) => {
    // Main chart background
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, width, height);
    
    // Chart area background
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, 0, width, height);
  };

  const drawGrid = (ctx, width, height, margin, minPrice, maxPrice) => {
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    const priceSteps = 8;
    for (let i = 0; i <= priceSteps; i++) {
      const y = margin + (i / priceSteps) * (height - margin * 2);
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(width - margin, y);
      ctx.stroke();
    }

    // Vertical grid lines
    const timeSteps = 10;
    for (let i = 0; i <= timeSteps; i++) {
      const x = margin + (i / timeSteps) * (width - margin * 2);
      ctx.beginPath();
      ctx.moveTo(x, margin);
      ctx.lineTo(x, height - margin);
      ctx.stroke();
    }
  };

  const drawPriceLabels = (ctx, width, height, margin, minPrice, maxPrice) => {
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';

    const priceSteps = 8;
    for (let i = 0; i <= priceSteps; i++) {
      const price = minPrice + (i / priceSteps) * (maxPrice - minPrice);
      const y = margin + (i / priceSteps) * (height - margin * 2);
      
      ctx.fillText(`$${price.toFixed(2)}`, margin - 10, y + 4);
    }
  };

  const drawTimeLabels = (ctx, width, height, margin, data) => {
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';

    const timeSteps = Math.min(6, data.length);
    for (let i = 0; i < timeSteps; i++) {
      const index = Math.floor((i / (timeSteps - 1)) * (data.length - 1));
      const candle = data[index];
      const time = new Date(candle.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const x = margin + (index / (data.length - 1)) * (width - margin * 2);
      ctx.fillText(time, x, height - 10);
    }
  };

  const drawLine = (ctx, data, values, margin, height, minPrice, range, color, width) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();

    values.forEach((value, index) => {
      const candle = data[index];
      const x = margin + (index / (data.length - 1)) * (ctx.canvas.width - margin * 2);
      const y = height - margin - ((value - minPrice) / range) * (height - margin * 2);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  };

  const drawVolumeBars = (ctx, width, chartHeight, volumeHeight, margin, data) => {
    const maxVolume = Math.max(...data.map(c => c.volume));
    const volumeY = chartHeight + 20;
    const volumeWidth = (width - margin * 2) / data.length;

    data.forEach((candle, index) => {
      const x = margin + index * volumeWidth;
      const height = (candle.volume / maxVolume) * volumeHeight;
      const isBullish = candle.close >= candle.open;
      const color = isBullish ? '#26a69a' : '#ef5350';

      ctx.fillStyle = color;
      ctx.fillRect(x, volumeY + volumeHeight - height, volumeWidth - 1, height);
    });
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find hovered candle
    const margin = 60;
    const chartWidth = canvasRef.current.width - margin * 2;
    const candleIndex = Math.floor((x - margin) / (chartWidth / candles.length));
    
    if (candleIndex >= 0 && candleIndex < candles.length) {
      const candle = candles[candleIndex];
      setHoveredCandle(candle);
      setTooltipPosition({ x: e.clientX, y: e.clientY });
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(5, prev * delta)));
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
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="h-96 flex items-center justify-center">
          <div className="text-purple-200">Loading TradingView chart...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="h-96 flex items-center justify-center">
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-semibold text-white">TradingView Chart</h3>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-purple-200">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-lg transition-colors ${
              isPlaying 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setZoom(1)}
            className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={1200}
          height={600}
          className="w-full h-96 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        />
        
        {candles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-purple-200">Waiting for candlestick data...</p>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && hoveredCandle && (
        <div 
          className="absolute bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-white shadow-lg z-10"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-300">Time:</span>
              <span>{formatTime(hoveredCandle.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Open:</span>
              <span className="text-white">{formatCurrency(hoveredCandle.open)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">High:</span>
              <span className="text-green-400">{formatCurrency(hoveredCandle.high)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Low:</span>
              <span className="text-red-400">{formatCurrency(hoveredCandle.low)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Close:</span>
              <span className="text-white">{formatCurrency(hoveredCandle.close)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Volume:</span>
              <span className="text-blue-400">{hoveredCandle.volume.toFixed(0)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Info */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <p className="text-purple-200">Timeframe</p>
          <p className="text-white font-medium">{timeframe.toUpperCase()}</p>
        </div>
        <div className="text-center">
          <p className="text-purple-200">Candles</p>
          <p className="text-white font-medium">{candles.length}</p>
        </div>
        <div className="text-center">
          <p className="text-purple-200">Current Price</p>
          <p className="text-green-400 font-medium">
            {currentPrice ? formatCurrency(currentPrice) : '---'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-purple-200">Zoom</p>
          <p className="text-white font-medium">{zoom.toFixed(1)}x</p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-green-400">Bullish</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-red-400">Bearish</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-2 bg-yellow-500 border-dashed border-yellow-500"></div>
          <span className="text-yellow-400">Current Price</span>
        </div>
        {showIndicators && (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-2 bg-red-400"></div>
              <span className="text-red-400">SMA 20</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-2 bg-cyan-400"></div>
              <span className="text-cyan-400">EMA 12</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-2 bg-blue-400"></div>
              <span className="text-blue-400">EMA 26</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TradingViewChart; 