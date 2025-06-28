// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WebSocketProvider } from './contexts/WebSocketContext';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import PriceMovement from './components/PriceMovement';
import CandlestickPage from './components/CandlestickPage';
import TradingViewPage from './components/TradingViewPage';
import TradingInterface from './components/TradingInterface';
import BalanceViewer from './components/BalanceViewer';
import Settings from './components/Settings';
import TradingLogs from './components/TradingLogs';

function App() {
  return (
    <WebSocketProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App mx-auto max-w-7xl">
          <Navigation />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/price-movement" element={<PriceMovement />} />
            <Route path="/candlestick" element={<CandlestickPage />} />
            <Route path="/tradingview" element={<TradingViewPage />} />
            <Route path="/trading" element={<TradingInterface />} />
            <Route path="/balance" element={<BalanceViewer />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/logs" element={<TradingLogs />} />
            {/* Catch-all route for 404 errors */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </WebSocketProvider>
  );
}

export default App;
