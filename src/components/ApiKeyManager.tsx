'use client';

import { useState } from 'react';

interface ApiKeyManagerProps {
  hasAnthropicAdminKey: boolean;
  hasMoonshotKey: boolean;
}

export default function ApiKeyManager({ 
  hasAnthropicAdminKey,
  hasMoonshotKey 
}: ApiKeyManagerProps) {
  const [anthropicAdminKey, setAnthropicAdminKey] = useState('');
  const [moonshotKey, setMoonshotKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const saveAnthropicAdminKey = async () => {
    if (!anthropicAdminKey.trim()) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'anthropic-admin', apiKey: anthropicAdminKey }),
      });
      
      if (!res.ok) throw new Error('Failed to save key');
      
      setMessage({ type: 'success', text: 'Anthropic Admin API key saved!' });
      setAnthropicAdminKey('');
    } catch {
      setMessage({ type: 'error', text: 'Failed to save API key' });
    } finally {
      setSaving(false);
    }
  };

  const saveMoonshotKey = async () => {
    if (!moonshotKey.trim()) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'moonshot', apiKey: moonshotKey }),
      });
      
      if (!res.ok) throw new Error('Failed to save key');
      
      setMessage({ type: 'success', text: 'Moonshot API key saved!' });
      setMoonshotKey('');
    } catch {
      setMessage({ type: 'error', text: 'Failed to save API key' });
    } finally {
      setSaving(false);
    }
  };

  const deleteKey = async (provider: 'anthropic-admin' | 'moonshot') => {
    if (!confirm(`Delete your ${provider} API key?`)) return;
    
    try {
      const res = await fetch(`/api/keys?provider=${provider}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete key');
      
      setMessage({ type: 'success', text: `${provider} API key deleted!` });
      window.location.reload();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete API key' });
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Anthropic Admin Section */}
      <div className="bg-white shadow rounded-lg p-6 border-2 border-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Anthropic Admin</h3>
            <p className="text-sm text-gray-500">For viewing usage and cost reports (requires organization account)</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${hasAnthropicAdminKey ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {hasAnthropicAdminKey ? 'Connected' : 'Recommended'}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <p className="text-sm text-blue-800">
            <strong>Why you need this:</strong> Anthropic requires an Admin API key to access usage and cost data. 
            Regular API keys can only make inference calls. Admin keys are available to organization admins at 
            <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="underline ml-1">console.anthropic.com</a>.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Admin API Key</label>
            <div className="mt-1 flex space-x-2">
              <input
                type="password"
                value={anthropicAdminKey}
                onChange={(e) => setAnthropicAdminKey(e.target.value)}
                placeholder={hasAnthropicAdminKey ? '••••••••••••••••' : 'sk-ant-admin-...'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={saveAnthropicAdminKey}
                disabled={saving || !anthropicAdminKey.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {hasAnthropicAdminKey && (
            <button
              onClick={() => deleteKey('anthropic-admin')}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove Admin API key
            </button>
          )}
        </div>
      </div>

      {/* Moonshot Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Moonshot.ai</h3>
            <p className="text-sm text-gray-500">Track Kimi API usage</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${hasMoonshotKey ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {hasMoonshotKey ? 'Connected' : 'Not Connected'}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">API Key</label>
            <div className="mt-1 flex space-x-2">
              <input
                type="password"
                value={moonshotKey}
                onChange={(e) => setMoonshotKey(e.target.value)}
                placeholder={hasMoonshotKey ? '••••••••••••••••' : 'sk-...'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={saveMoonshotKey}
                disabled={saving || !moonshotKey.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {hasMoonshotKey && (
            <button
              onClick={() => deleteKey('moonshot')}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove API key
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
