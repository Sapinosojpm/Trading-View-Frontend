import React, { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket.js';

const TradingLogs = () => {
  const [logs, setLogs] = useState([]);
  const [autoTradeStatus, setAutoTradeStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // WebSocket connection
  const { isConnected, lastMessage } = useWebSocket('ws://localhost:4000');

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'order_update':
          addLog(`📋 Order: ${lastMessage.data.side.toUpperCase()} ${lastMessage.data.amount} SOL`, 'order');
          break;
          
        case 'balance_update':
          addLog('💰 Balance updated', 'balance');
          break;
          
        case 'trading_log':
          // Handle auto-trading logs from the bot
          addLog(lastMessage.data.message, lastMessage.data.type);
          break;
          
        default:
          break;
      }
    }
  }, [lastMessage]);

  // Fetch auto-trade status
  useEffect(() => {
    const fetchAutoTradeStatus = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/autotrade/status');
        if (response.ok) {
          const status = await response.json();
          setAutoTradeStatus(status);
        }
      } catch (error) {
        console.error('Error fetching auto-trade status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAutoTradeStatus();
    const interval = setInterval(fetchAutoTradeStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleAutoTrading = async () => {
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      const response = await fetch('http://localhost:4000/api/autotrade/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setAutoTradeStatus(prev => ({
          ...prev,
          enabled: result.enabled
        }));
        addLog(`🤖 ${result.message}`, 'info');
      } else {
        addLog('❌ Failed to toggle auto-trading', 'error');
      }
    } catch (error) {
      console.error('Error toggling auto-trading:', error);
      addLog('❌ Error toggling auto-trading', 'error');
    } finally {
      setIsToggling(false);
    }
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = {
      id: Date.now(),
      timestamp,
      message,
      type
    };

    setLogs(prev => {
      const updatedLogs = [newLog, ...prev.slice(0, 99)]; // Keep last 100 logs
      return updatedLogs;
    });
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'order':
        return '📋';
      case 'balance':
        return '💰';
      case 'buy':
        return '🟢';
      case 'sell':
        return '🔴';
      case 'profit':
        return '🎯';
      case 'loss':
        return '🛑';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'buy':
        return 'text-green-400';
      case 'sell':
        return 'text-red-400';
      case 'profit':
        return 'text-yellow-400';
      case 'loss':
        return 'text-red-500';
      case 'error':
        return 'text-red-600';
      case 'order':
        return 'text-blue-400';
      case 'balance':
        return 'text-purple-400';
      case 'info':
        return 'text-gray-300';
      default:
        return 'text-gray-300';
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading trading logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Trading Logs</h1>
        <p className="text-purple-200">Real-time auto-trading activity and system logs</p>
      </div>

      {/* Auto-Trade Status with Toggle */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Auto-Trade Status</h2>
          
          {/* Toggle Switch */}
          <div className="flex items-center space-x-3">
            <span className="text-white text-sm font-medium">
              {autoTradeStatus?.enabled ? 'ON' : 'OFF'}
            </span>
            <button
              onClick={toggleAutoTrading}
              disabled={isToggling}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                autoTradeStatus?.enabled 
                  ? 'bg-green-600' 
                  : 'bg-gray-600'
              } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoTradeStatus?.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            {isToggling && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${autoTradeStatus?.enabled ? 'text-green-400' : 'text-red-400'}`}>
              {autoTradeStatus?.enabled ? '🟢 ACTIVE' : '🔴 INACTIVE'}
            </div>
            <p className="text-purple-200 text-sm">Status</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {autoTradeStatus?.strategy || 'N/A'}
            </div>
            <p className="text-purple-200 text-sm">Strategy</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {autoTradeStatus?.interval || 'N/A'}
            </div>
            <p className="text-purple-200 text-sm">Interval</p>
          </div>
        </div>
        {autoTradeStatus?.lastRun && (
          <div className="mt-4 text-center">
            <p className="text-purple-200 text-sm">
              Last Run: {new Date(autoTradeStatus.lastRun).toLocaleString()}
            </p>
          </div>
        )}
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
          {isConnected ? 'Live Logs Connected' : 'Connecting...'}
        </div>
      </div>

      {/* Logs Container */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Trading Activity Logs</h3>
          <button
            onClick={clearLogs}
            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Clear Logs
          </button>
        </div>

        {/* Logs List */}
        <div className="h-96 overflow-y-auto space-y-2">
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-purple-200">No logs yet. Auto-trading activity will appear here.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start space-x-3 p-3 rounded-lg bg-white/5 border border-white/10 ${
                  getLogColor(log.type)
                }`}
              >
                <span className="text-lg">{getLogIcon(log.type)}</span>
                <div className="flex-1">
                  <p className="font-medium">{log.message}</p>
                  <p className="text-xs opacity-70">{log.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Log Count */}
        <div className="mt-4 text-center">
          <p className="text-purple-200 text-sm">
            {logs.length} log entries • Auto-refresh enabled
          </p>
        </div>
      </div>

      {/* Manual Log Entry (for testing) */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mt-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Add Test Log</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => addLog('🟢 Manual BUY order placed', 'buy')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Buy Log
          </button>
          <button
            onClick={() => addLog('🔴 Manual SELL order placed', 'sell')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Add Sell Log
          </button>
          <button
            onClick={() => addLog('🎯 Profit target reached', 'profit')}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Add Profit Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradingLogs;