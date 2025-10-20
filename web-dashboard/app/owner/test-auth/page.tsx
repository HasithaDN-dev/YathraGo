"use client";

import React, { useState } from 'react';
import { ownerApi } from '@/lib/api/owner';

interface TestResult {
  test: string;
  result: unknown;
  error?: unknown;
  timestamp: string;
}

export default function TestAuthPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, result: unknown, error?: unknown) => {
    setResults(prev => [...prev, {
      test,
      result,
      error,
      timestamp: new Date().toISOString()
    }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testCookies = () => {
    if (typeof document === 'undefined') {
      addResult('Cookies Test', null, 'Not in browser environment');
      return;
    }

    const cookies = document.cookie;
    const accessToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];

    addResult('Cookies Test', {
      allCookies: cookies,
      accessToken: accessToken ? 'Found' : 'Not found',
      tokenValue: accessToken ? accessToken.substring(0, 20) + '...' : null
    });
  };

  const testProfile = async () => {
    setLoading(true);
    try {
      const profile = await ownerApi.getProfile();
      addResult('Profile Test', profile);
    } catch (error) {
      addResult('Profile Test', null, error);
    } finally {
      setLoading(false);
    }
  };

  const testDrivers = async () => {
    setLoading(true);
    try {
      const drivers = await ownerApi.getDrivers();
      addResult('Drivers Test', drivers);
    } catch (error) {
      addResult('Drivers Test', null, error);
    } finally {
      setLoading(false);
    }
  };

  const testVehicles = async () => {
    setLoading(true);
    try {
      const vehicles = await ownerApi.getVehicles();
      addResult('Vehicles Test', vehicles);
    } catch (error) {
      addResult('Vehicles Test', null, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication & API Testing</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testCookies}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Cookies
        </button>
        
        <button
          onClick={testProfile}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Profile API
        </button>
        
        <button
          onClick={testDrivers}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Drivers API
        </button>
        
        <button
          onClick={testVehicles}
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Test Vehicles API
        </button>
        
        <button
          onClick={clearResults}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      {loading && (
        <div className="text-blue-600 mb-4">Testing...</div>
      )}

      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="border rounded p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{result.test}</h3>
              <span className="text-sm text-gray-500">{result.timestamp}</span>
            </div>
            
            {result.error ? (
              <div className="text-red-600">
                <strong>Error:</strong>
                <pre className="mt-2 bg-red-50 p-2 rounded overflow-auto text-sm">
                  {JSON.stringify(result.error, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-green-600">
                <strong>Success:</strong>
                <pre className="mt-2 bg-green-50 p-2 rounded overflow-auto text-sm">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}