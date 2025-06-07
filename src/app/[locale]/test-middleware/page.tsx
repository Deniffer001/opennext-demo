'use client';

import { useState, useEffect } from 'react';

interface RequestInfo {
  url: string;
  headers: Record<string, string>;
  timestamp: string;
}

export default function TestMiddlewarePage() {
  const [requestInfo, setRequestInfo] = useState<RequestInfo | null>(null);
  const [testResults, setTestResults] = useState<RequestInfo[]>([]);

  useEffect(() => {
    // Get current page headers
    fetch(window.location.href)
      .then(response => {
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        
        setRequestInfo({
          url: window.location.href,
          headers,
          timestamp: new Date().toISOString()
        });
      })
      .catch(console.error);
  }, []);

  const testEndpoint = async (url: string, label: string) => {
    try {
      const response = await fetch(url);
      const headers: Record<string, string> = {};
      
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      setTestResults(prev => [...prev, {
        url: `${label}: ${url}`,
        headers,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Middleware Testing Dashboard</h1>
      
      <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Current Page Request Info</h2>
        {requestInfo ? (
          <div>
            <p className="mb-2"><strong>URL:</strong> {requestInfo.url}</p>
            <p className="mb-2"><strong>Timestamp:</strong> {requestInfo.timestamp}</p>
            <div>
              <strong>Headers from Middleware:</strong>
              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                {JSON.stringify(
                  Object.fromEntries(
                    Object.entries(requestInfo.headers).filter(([key]) => 
                      key.startsWith('x-') || key.includes('cache') || key.includes('middleware')
                    )
                  ), 
                  null, 
                  2
                )}
              </pre>
            </div>
          </div>
        ) : (
          <p>Loading request info...</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => testEndpoint('/api/test-cache', 'API Cache Test')}
          className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test API Middleware
        </button>
        
        <button
          onClick={() => testEndpoint('/api/cache-demo', 'API Cache Demo')}
          className="p-4 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Cache Demo API
        </button>
        
        <button
          onClick={() => testEndpoint('/test-cache', 'Cache Test Page')}
          className="p-4 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Page Middleware
        </button>
        
        <button
          onClick={() => window.open('/test-redirect', '_blank')}
          className="p-4 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Test Redirect
        </button>
        
        <button
          onClick={() => window.open('/test-rewrite', '_blank')}
          className="p-4 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Test Rewrite
        </button>
        
        <button
          onClick={() => testEndpoint('/', 'Home Page')}
          className="p-4 bg-teal-500 text-white rounded hover:bg-teal-600"
        >
          Test Home Page
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
          <span>Total tests: {testResults.length}</span>
        </div>
      </div>

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{result.url}</h3>
              <span className="text-sm text-gray-500">{result.timestamp}</span>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Middleware Headers:</strong>
                <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                  {JSON.stringify(
                    Object.fromEntries(
                      Object.entries(result.headers).filter(([key]) => 
                        key.startsWith('x-') || key.includes('cache') || key.includes('middleware')
                      )
                    ), 
                    null, 
                    2
                  )}
                </pre>
              </div>
              
              <div className="text-sm">
                <strong>All Response Headers:</strong>
                <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                  {JSON.stringify(result.headers, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
        <h2 className="font-semibold mb-2">Middleware Testing Guide:</h2>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li><strong>Headers:</strong> Check for X-Middleware-* headers added by middleware</li>
          <li><strong>Timing:</strong> X-Middleware-Processing-Time shows middleware execution time</li>
          <li><strong>API Routes:</strong> Should have X-API-Request and X-Cache-Test headers</li>
          <li><strong>Redirect:</strong> /test-redirect should redirect to /test-cache</li>
          <li><strong>Rewrite:</strong> /test-rewrite should show /test-cache content but keep URL</li>
          <li><strong>Cache Routes:</strong> Should have X-Cache-Testing-Route header</li>
          <li><strong>Console:</strong> Check browser console for middleware logs</li>
        </ul>
      </div>
    </div>
  );
}
