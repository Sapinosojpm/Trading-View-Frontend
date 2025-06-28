import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const Navigation = ({ activeTab, onTabChange }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', icon: ChartBarIcon, id: '/', path: '/' },
    { name: 'Price Movement', icon: ChartBarIcon, id: 'price-movement', path: '/price-movement' },
    { name: 'Candlestick', icon: ChartBarIcon, id: 'candlestick', path: '/candlestick' },
    { name: 'TradingView', icon: ChartBarIcon, id: 'tradingview', path: '/tradingview' },
    { name: 'Trading', icon: DocumentTextIcon, id: 'trading', path: '/trading' },
    { name: 'Balance', icon: CurrencyDollarIcon, id: 'balance', path: '/balance' },
    { name: 'Logs', icon: DocumentTextIcon, id: 'logs', path: '/logs' },
    { name: 'Settings', icon: Cog6ToothIcon, id: 'settings', path: '/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-violet-800 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.94 5.5c.944-.945 2.56-.276 2.56 1.06V10l5.5-5.5c.944-.945 2.56-.276 2.56 1.06V10l-8.06 8.06c-.944.945-2.56.276-2.56-1.06V10l8.06-8.06z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">SOLANA Trading Bot</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition"
            >
              {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-lg border-t border-gray-200">
          <div className="p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
