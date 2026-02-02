'use client';

import { useState, useEffect } from 'react';

interface UsageStatsProps {
  hasAnthropicKey: boolean;
  hasMoonshotKey: boolean;
}

interface AnthropicStats {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  dailyUsage: { date: string; input: number; output: number; cost: number }[];
}

interface MoonshotStats {
  balance: string;
  currency: string;
}

export default function UsageStats({ hasAnthropicKey, hasMoonshotKey }: UsageStatsProps) {
  const [loading, setLoading] = useState(false);
  const [anthropicStats, setAnthropicStats] = useState<AnthropicStats | null>(null);
  const [moonshotStats, setMoonshotStats] = useState<MoonshotStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      if (hasAnthropicKey) {
        const res = await fetch('/api/anthropic/usage');
        if (res.ok) {
          const data = await res.json();
          setAnthropicStats(data);
        }
      }

      if (hasMoonshotKey) {
        const res = await fetch('/api/moonshot/usage');
        if (res.ok) {
          const data = await res.json();
          setMoonshotStats(data);
        }
      }
    } catch (err) {
      setError('Failed to fetch usage stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [hasAnthropicKey, hasMoonshotKey]);

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Usage Overview</h2>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Anthropic Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Anthropic</h3>
            <div className={`w-3 h-3 rounded-full ${hasAnthropicKey ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>

          {!hasAnthropicKey ? (
            <p className="text-gray-500 text-sm">
              Add your Anthropic API key in the API Keys tab to see usage stats.
            </p>
          ) : anthropicStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-xs text-blue-600 uppercase font-semibold">Input Tokens</p>
                  <p className="text-xl font-bold text-blue-900">
                    {anthropicStats.totalInputTokens.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-md">
                  <p className="text-xs text-purple-600 uppercase font-semibold">Output Tokens</p>
                  <p className="text-xl font-bold text-purple-900">
                    {anthropicStats.totalOutputTokens.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-600 uppercase font-semibold">Estimated Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${anthropicStats.totalCost.toFixed(2)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading...</p>
          )}
        </div>

        {/* Moonshot Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Moonshot.ai</h3>
            <div className={`w-3 h-3 rounded-full ${hasMoonshotKey ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>

          {!hasMoonshotKey ? (
            <p className="text-gray-500 text-sm">
              Add your Moonshot API key in the API Keys tab to see balance.
            </p>
          ) : moonshotStats ? (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-xs text-green-600 uppercase font-semibold">Current Balance</p>
                <p className="text-3xl font-bold text-green-900">
                  {moonshotStats.currency === 'CNY' ? '¥' : '$'}
                  {parseFloat(moonshotStats.balance).toFixed(2)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {moonshotStats.currency}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                Moonshot provides balance info only. Token-level usage is not available via API.
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Loading...</p>
          )}
        </div>
      </div>

      {/* Anthropic Daily Usage Chart */}
      {anthropicStats?.dailyUsage && anthropicStats.dailyUsage.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Usage (Last 7 Days)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Input</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Output</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {anthropicStats.dailyUsage.map((day) => (
                  <tr key={day.date}>
                    <td className="px-4 py-2 text-sm text-gray-900">{day.date}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">{day.input.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">{day.output.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-right">${day.cost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
