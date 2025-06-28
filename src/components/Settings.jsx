import { useState } from 'react';
import { 
  Cog6ToothIcon,
  KeyIcon,
  ShieldCheckIcon,
  BellIcon,
  ChartBarIcon,
  GlobeAltIcon,
  SparklesIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    botName: 'SOLANA Trading Bot',
    timezone: 'UTC',
    language: 'English',
    
    // API Settings
    apiKey: '••••••••••••••••',
    apiSecret: '••••••••••••••••',
    passphrase: '••••••••••••••••',
    
    // Trading Settings
    maxDailyTrades: 50,
    maxTradeAmount: 1000,
    riskPercentage: 2,
    preferredPairs: ['SOL/USDT', 'SOL/USDC'],
    
    // Notification Settings
    emailNotifications: true,
    telegramNotifications: false,
    tradeAlerts: true,
    errorAlerts: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    ipWhitelist: []
  });

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'api', name: 'API Configuration', icon: KeyIcon },
    { id: 'trading', name: 'Trading', icon: ChartBarIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Bot Name
        </label>
        <input
          type="text"
          value={settings.botName}
          onChange={(e) => handleSettingChange('general', 'botName', e.target.value)}
          className="input-field border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            className="input-field border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="UTC">UTC</option>
            <option value="EST">Eastern Time</option>
            <option value="PST">Pacific Time</option>
            <option value="GMT">GMT</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Language
          </label>
          <select
            value={settings.language}
            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
            className="input-field border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAPISettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-800">Security Notice</h3>
            <p className="text-purple-700 mt-2">
              Your SOLANA trading API credentials are encrypted and stored securely. Never share these with anyone.
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          API Key
        </label>
        <input
          type="password"
          value={settings.apiKey}
          onChange={(e) => handleSettingChange('api', 'apiKey', e.target.value)}
          className="input-field border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
          placeholder="Enter your SOLANA trading API key"
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          API Secret
        </label>
        <input
          type="password"
          value={settings.apiSecret}
          onChange={(e) => handleSettingChange('api', 'apiSecret', e.target.value)}
          className="input-field border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
          placeholder="Enter your SOLANA trading API secret"
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Passphrase
        </label>
        <input
          type="password"
          value={settings.passphrase}
          onChange={(e) => handleSettingChange('api', 'passphrase', e.target.value)}
          className="input-field border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
          placeholder="Enter your SOLANA trading passphrase"
        />
      </div>
      
      <button className="btn-primary bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-semibold">
        Test SOLANA API Connection
      </button>
    </div>
  );

  const renderTradingSettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <SparklesIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">SOLANA Trading Settings</h3>
            <p className="text-green-700 mt-2">
              Configure your SOLANA trading parameters for optimal performance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Max Daily Trades
          </label>
          <input
            type="number"
            value={settings.maxDailyTrades}
            onChange={(e) => handleSettingChange('trading', 'maxDailyTrades', parseInt(e.target.value))}
            className="input-field border-2 border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Max Trade Amount (SOL)
          </label>
          <input
            type="number"
            value={settings.maxTradeAmount}
            onChange={(e) => handleSettingChange('trading', 'maxTradeAmount', parseFloat(e.target.value))}
            className="input-field border-2 border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Risk Percentage per Trade (%)
        </label>
        <input
          type="number"
          value={settings.riskPercentage}
          onChange={(e) => handleSettingChange('trading', 'riskPercentage', parseFloat(e.target.value))}
          className="input-field border-2 border-gray-200 focus:border-green-500 focus:ring-green-500"
          step="0.1"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Preferred Trading Pairs
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['SOL/USDT', 'SOL/USDC', 'RAY/SOL', 'SRM/SOL', 'ORCA/SOL'].map((pair) => (
            <label key={pair} className="flex items-center space-x-2 p-3 border-2 border-gray-200 rounded-xl hover:border-purple-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.preferredPairs.includes(pair)}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleSettingChange('trading', 'preferredPairs', [...settings.preferredPairs, pair]);
                  } else {
                    handleSettingChange('trading', 'preferredPairs', settings.preferredPairs.filter(p => p !== pair));
                  }
                }}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">{pair}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BellIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-800">Notification Settings</h3>
            <p className="text-blue-700 mt-2">
              Stay informed about your SOLANA trading activities with real-time notifications.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <h4 className="font-semibold text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-600">Receive trade alerts via email</p>
          </div>
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <h4 className="font-semibold text-gray-900">Telegram Notifications</h4>
            <p className="text-sm text-gray-600">Get instant alerts on Telegram</p>
          </div>
          <input
            type="checkbox"
            checked={settings.telegramNotifications}
            onChange={(e) => handleSettingChange('notifications', 'telegramNotifications', e.target.checked)}
            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <h4 className="font-semibold text-gray-900">Trade Alerts</h4>
            <p className="text-sm text-gray-600">Notify on successful trades</p>
          </div>
          <input
            type="checkbox"
            checked={settings.tradeAlerts}
            onChange={(e) => handleSettingChange('notifications', 'tradeAlerts', e.target.checked)}
            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <h4 className="font-semibold text-gray-900">Error Alerts</h4>
            <p className="text-sm text-gray-600">Notify on trading errors</p>
          </div>
          <input
            type="checkbox"
            checked={settings.errorAlerts}
            onChange={(e) => handleSettingChange('notifications', 'errorAlerts', e.target.checked)}
            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <ShieldCheckIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-800">Security Settings</h3>
            <p className="text-red-700 mt-2">
              Protect your SOLANA trading account with advanced security features.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <h4 className="font-semibold text-gray-900">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-600">Add an extra layer of security</p>
          </div>
          <input
            type="checkbox"
            checked={settings.twoFactorAuth}
            onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
            className="input-field border-2 border-gray-200 focus:border-red-500 focus:ring-red-500"
          />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'api':
        return renderAPISettings();
      case 'trading':
        return renderTradingSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
          <Cog6ToothIcon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SOLANA Settings</h1>
          <p className="text-gray-600 text-lg">Configure your SOLANA trading bot preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card hover:shadow-lg transition-all duration-300">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card hover:shadow-lg transition-all duration-300">
            {renderTabContent()}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                <button className="btn-secondary px-6 py-3 font-semibold">
                  Cancel
                </button>
                <button className="btn-primary px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-semibold">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 