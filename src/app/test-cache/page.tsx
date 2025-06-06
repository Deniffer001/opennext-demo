'use client';

import { useState } from 'react';

interface ResponseData {
  label: string;
  url: string;
  timestamp: string;
  data?: unknown;
  error?: string;
  headers?: Record<string, string>;
}

export default function TestCachePage() {
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (url: string, label: string) => {
    setLoading(true);
    try {
      const response = await fetch(url);
      const data = await response.json();

      setResponses(prev => [...prev, {
        label,
        url,
        timestamp: new Date().toISOString(),
        data,
        headers: Object.fromEntries(response.headers.entries())
      }]);
    } catch (error) {
      setResponses(prev => [...prev, {
        label,
        url,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }]);
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResponses([]);
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Cache Testing Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => testEndpoint('/api/test-cache', 'Basic Cache Test')}
          disabled={loading}
          className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Basic Cache
        </button>

        <button
          onClick={() => testEndpoint('/api/test-cache?revalidate=10', 'Cache (10s revalidate)')}
          disabled={loading}
          className="p-4 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test 10s Revalidate
        </button>

        <button
          onClick={() => testEndpoint('/api/cache-demo?type=no-cache', 'No Cache')}
          disabled={loading}
          className="p-4 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Test No Cache
        </button>

        <button
          onClick={() => testEndpoint('/api/cache-demo?type=revalidate-10', 'ISR 10s')}
          disabled={loading}
          className="p-4 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test ISR 10s
        </button>

        <button
          onClick={() => testEndpoint('/api/cache-demo?type=revalidate-60', 'ISR 60s')}
          disabled={loading}
          className="p-4 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Test ISR 60s
        </button>

        <button
          onClick={() => testEndpoint('/api/cache-demo?type=force-cache', 'Force Cache')}
          disabled={loading}
          className="p-4 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50"
        >
          Test Force Cache
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
        <div className="text-sm text-gray-600 flex items-center">
          {loading && <span>Loading...</span>}
          <span className="ml-4">Total requests: {responses.length}</span>
        </div>
      </div>

      <div className="space-y-4">
        {responses.map((response, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{response.label}</h3>
              <span className="text-sm text-gray-500">{response.timestamp}</span>
            </div>

            <p className="text-sm text-blue-600 mb-2">{response.url}</p>

            {response.error ? (
              <div className="text-red-500">Error: {response.error}</div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Response Data:</strong>
                  <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>

                <div className="text-sm">
                  <strong>Response Headers:</strong>
                  <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h2 className="font-semibold mb-2">Testing Instructions:</h2>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Click the same button multiple times quickly to test caching</li>
          <li>Compare timestamps and requestId to see if responses are cached</li>
          <li>Wait for revalidation time to pass, then test again</li>
          <li>Check the browser Network tab to see actual HTTP requests</li>
          <li>No Cache should always make new requests</li>
          <li>ISR endpoints should cache responses for the specified duration</li>
        </ul>
      </div>
    </div>
  );
}
