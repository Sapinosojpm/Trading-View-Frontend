import React, { useEffect, useRef, useState } from 'react';
import useWebSocket from '../hooks/useWebSocket.js';

const CandlestickChart = ({ timeframe = '1m', maxCandles = 50 }) => {
  const canvasRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // WebSocket connection
  const { isConnected, lastMessage } = useWebSocket('ws://localhost:4000');

  // Fetch initial candlestick data
  useEffect(() => {
    const fetchCandles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:4000/api/okx/price-movement?timeframe=${timeframe}&limit=${maxCandles}`);
        
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
    if (lastMessage && lastMessage.type === 'price_update') {
      const newPrice = lastMessage.data.price;
      const timestamp = lastMessage.timestamp || new Date().toISOString();
      
      setCurrentPrice(newPrice);
      
      // Update the latest candle or create a new one
      updateCandles(newPrice, timestamp);
    }
  }, [lastMessage]);

  const updateCandles = (price, timestamp) => {
    setCandles(prevCandles => {
      if (prevCandles.length === 0) {
        // Create first candle
        return [{
          timestamp: new Date(timestamp).getTime(),
          open: price,
          high: price,
          low: price,
          close: price,
          volume: 0
        }];
      }

      const now = new Date(timestamp).getTime();
      const lastCandle = prevCandles[prevCandles.length - 1];
      const candleTime = new Date(lastCandle.timestamp).getTime();
      
      // Check if we need a new candle based on timeframe
      const timeframeMs = getTimeframeMs(timeframe);
      const shouldCreateNewCandle = (now - candleTime) >= timeframeMs;
      
      if (shouldCreateNewCandle) {
        // Create new candle
        const newCandle = {
          timestamp: now,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: 0
        };
        
        const updatedCandles = [...prevCandles, newCandle];
        // Keep only the last maxCandles
        return updatedCandles.slice(-maxCandles);
      } else {
        // Update current candle
        const updatedCandles = [...prevCandles];
        const currentCandle = updatedCandles[updatedCandles.length - 1];
        
        currentCandle.high = Math.max(currentCandle.high, price);
        currentCandle.low = Math.min(currentCandle.low, price);
        currentCandle.close = price;
        
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
      default: return 60 * 1000;
    }
  };

  // Draw candlestick chart
  useEffect(() => {
    if (!canvasRef.current || candles.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate price range
    const prices = candles.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Add some padding
    const padding = priceRange * 0.1;
    const chartMin = minPrice - padding;
    const chartMax = maxPrice + padding;
    const chartRange = chartMax - chartMin;

    // Calculate dimensions
    const candleWidth = Math.max(2, (width - 40) / candles.length - 2);
    const candleSpacing = (width - 40) / candles.length;

    // Draw grid
    drawGrid(ctx, width, height, chartMin, chartMax);

    // Draw candlesticks
    candles.forEach((candle, index) => {
      const x = 20 + index * candleSpacing + candleSpacing / 2;
      
      // Calculate y positions
      const openY = height - 20 - ((candle.open - chartMin) / chartRange) * (height - 40);
      const closeY = height - 20 - ((candle.close - chartMin) / chartRange) * (height - 40);
      const highY = height - 20 - ((candle.high - chartMin) / chartRange) * (height - 40);
      const lowY = height - 20 - ((candle.low - chartMin) / chartRange) * (height - 40);

      // Determine if candle is bullish or bearish
      const isBullish = candle.close >= candle.open;
      const color = isBullish ? '#10b981' : '#ef4444';
      const fillColor = isBullish ? '#10b981' : '#ef4444';

      // Draw wick (high-low line)
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

    // Draw current price line
    if (currentPrice) {
      const currentY = height - 20 - ((currentPrice - chartMin) / chartRange) * (height - 40);
      
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(20, currentY);
      ctx.lineTo(width - 20, currentY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw price labels
    drawPriceLabels(ctx, width, height, chartMin, chartMax);

  }, [candles, currentPrice]);

  const drawGrid = (ctx, width, height, minPrice, maxPrice) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    const priceSteps = 5;
    for (let i = 0; i <= priceSteps; i++) {
      const y = 20 + (i / priceSteps) * (height - 40);
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }

    // Vertical grid lines
    const timeSteps = Math.min(10, candles.length);
    for (let i = 0; i <= timeSteps; i++) {
      const x = 20 + (i / timeSteps) * (width - 40);
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, height - 20);
      ctx.stroke();
    }
  };

  const drawPriceLabels = (ctx, width, height, minPrice, maxPrice) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';

    const priceSteps = 5;
    for (let i = 0; i <= priceSteps; i++) {
      const price = minPrice + (i / priceSteps) * (maxPrice - minPrice);
      const y = 20 + (i / priceSteps) * (height - 40);
      
      ctx.fillText(`$${price.toFixed(2)}`, 15, y + 4);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Candlestick Chart</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-purple-200">Loading candlestick data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Candlestick Chart</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Candlestick Chart</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-purple-200">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-64 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg"
        />
        
        {candles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-purple-200">Waiting for candlestick data...</p>
          </div>
        )}
      </div>

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
            {currentPrice ? `$${currentPrice.toFixed(2)}` : '---'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-purple-200">Last Update</p>
          <p className="text-white font-medium">
            {candles.length > 0 ? formatTime(candles[candles.length - 1].timestamp) : '---'}
          </p>
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
      </div>
    </div>
  );
};

export default CandlestickChart; 