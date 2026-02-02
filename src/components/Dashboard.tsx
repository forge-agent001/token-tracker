'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import ApiKeyManager from './ApiKeyManager';
import UsageStats from './UsageStats';

interface DashboardProps {
  user: User;
  hasAnthropicKey: boolean;
  hasAnthropicAdminKey: boolean;
  hasMoonshotKey: boolean;
}

export default function Dashboard({ 
  user, 
  hasAnthropicKey, 
  hasAnthropicAdminKey,
  hasMoonshotKey 
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Token Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              API Keys
            </button>
          </nav>
        </div>

        {activeTab === 'overview' && (
          <UsageStats 
            hasAnthropicKey={hasAnthropicKey}
            hasAnthropicAdminKey={hasAnthropicAdminKey}
            hasMoonshotKey={hasMoonshotKey}
          />
        )}

        {activeTab === 'settings' && (
          <ApiKeyManager 
            hasAnthropicKey={hasAnthropicKey}
            hasAnthropicAdminKey={hasAnthropicAdminKey}
            hasMoonshotKey={hasMoonshotKey}
          />
        )}
      </main>
    </div>
  );
}
