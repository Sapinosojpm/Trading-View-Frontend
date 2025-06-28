// src/components/BalanceViewer.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SparklesIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

const BalanceViewer = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:4000/api/okx/balance');
      setBalance(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching balance:', error);
      setError('Failed to load SOL balance data from OKX. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount, currency = 'USD') => {
    // Handle cryptocurrency codes that aren't valid ISO currency codes
    if (currency === 'USDT' || currency === 'USDC') {
      currency = 'USD'; // Use USD for stablecoins
    }
    
    // For SOL and other crypto, use custom formatting
    if (currency === 'SOL') {
      return `${parseFloat(amount).toFixed(4)} SOL`;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading && !balance) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !balance) {
    return (
      <div className="card border-red-200 bg-red-50">
        <div className="flex items-center space-x-3">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Connection Error</h3>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchBalance}
              className="btn-primary mt-3 flex items-center space-x-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SOL Balance (OKX)</h1>
            <p className="text-gray-500 text-sm">
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
            </p>
          </div>
        </div>
        <button 
          onClick={fetchBalance}
          disabled={loading}
          className="btn-secondary flex items-center space-x-3 px-6 py-3 hover:bg-gray-100 transition-all duration-300"
        >
          <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span className="font-semibold">{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Balance Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 font-semibold text-sm">Total Balance</p>
              <p className="text-3xl font-bold text-purple-900">
                {balance?.total ? formatCurrency(balance.total) : 'N/A'}
              </p>
              <p className="text-xs text-purple-600 font-medium mt-1">OKX Exchange</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Available Balance Card */}
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-semibold text-sm">Available Balance</p>
              <p className="text-3xl font-bold text-green-900">
                {balance?.available ? formatCurrency(balance.available) : 'N/A'}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1">Ready to trade</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <WalletIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Frozen Balance Card */}
        <div className="card bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 font-semibold text-sm">Frozen Balance</p>
              <p className="text-3xl font-bold text-orange-900">
                {balance?.frozen ? formatCurrency(balance.frozen) : 'N/A'}
              </p>
              <p className="text-xs text-orange-600 font-medium mt-1">In open orders</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* SOL and USDT Specific Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SOL Balance Details */}
        <div className="card hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">SOL Balance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-semibold text-purple-900">{formatCurrency(balance?.SOL?.total || 0, 'SOL')}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Available</span>
              <span className="font-semibold text-green-900">{formatCurrency(balance?.SOL?.available || 0, 'SOL')}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm text-gray-600">Frozen</span>
              <span className="font-semibold text-orange-900">{formatCurrency(balance?.SOL?.frozen || 0, 'SOL')}</span>
            </div>
          </div>
        </div>

        {/* USDT Balance Details */}
        <div className="card hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">USDT Balance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-semibold text-blue-900">{formatCurrency(balance?.USDT?.total || 0, 'USDT')}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Available</span>
              <span className="font-semibold text-green-900">{formatCurrency(balance?.USDT?.available || 0, 'USDT')}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm text-gray-600">Frozen</span>
              <span className="font-semibold text-orange-900">{formatCurrency(balance?.USDT?.frozen || 0, 'USDT')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Status */}
      <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">OKX Exchange Connected</h3>
              <p className="text-sm text-green-600">Real-time balance data from OKX</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-600 font-medium">Live Data</p>
            <p className="text-xs text-green-500">Auto-refresh every 30s</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceViewer;
