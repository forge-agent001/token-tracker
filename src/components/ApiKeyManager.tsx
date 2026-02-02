'use client';

import { useState } from 'react';

interface ApiKeyManagerProps {
  hasAnthropicKey: boolean;
  hasMoonshotKey: boolean;
}

export default function ApiKeyManager({ hasAnthropicKey, hasMoonshotKey }: ApiKeyManagerProps) {
  const [anthropicKey, setAnthropicKey] = useState('');
  const [moonshotKey, setMoonshotKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const saveAnthropicKey = async () => {
    if (!anthropicKey.trim()) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'anthropic', apiKey: anthropicKey }),
      });
      
      if (!res.ok) throw new Error('Failed to save key');
      
      setMessage({ type: 'success', text: 'Anthropic API key saved!' });
      setAnthropicKey('');
    } catch (err) {
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
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save API key' });
    } finally {
      setSaving(false);
    }
  };

  const deleteKey = async (provider: 'anthropic' | 'moonshot') => {
    if (!confirm(`Delete your ${provider} API key?`)) return;
    
    try {
      const res = await fetch(`/api/keys?provider=${provider}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete key');
      
      setMessage({ type: 'success', text: `${provider} API key deleted!` });
      window.location.reload();
    } catch (err) {
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

      {/* Anthropic Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Anthropic</h3>
            <p className="text-sm text-gray-500">Track Claude API usage</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${hasAnthropicKey ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {hasAnthropicKey ? 'Connected' : 'Not Connected'}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">API Key</label>
            <div className="mt-1 flex space-x-2">
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder={hasAnthropicKey ? '••••••••••••••••' : 'sk-ant-api03-...'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={saveAnthropicKey}
                disabled={saving || !anthropicKey.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {hasAnthropicKey && (
            <button
              onClick={() => deleteKey('anthropic')}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove API key
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
