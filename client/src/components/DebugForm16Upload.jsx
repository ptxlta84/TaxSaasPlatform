import React, { useState } from 'react';


const DebugForm16Upload = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const testUpload = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/debug/form16-upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        });
        const data = await response.json();
        setResult(data);
        
        // Optional: Force dashboard update logic if we wanted to test hydration
        // Optional: Force dashboard update logic if we wanted to test hydration
    } catch (err) {
        setResult({ error: err.message });
    } finally {
        setLoading(false);
    }
  };
  
  return (
    <div className="p-6 border-2 border-red-500 rounded-lg bg-red-50 my-6">
      <h3 className="text-red-700 font-bold mb-4">🚨 DEBUG MODE: Form-16 Upload Test</h3>
      <button 
        onClick={testUpload}
        disabled={loading}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Upload with Mock Data'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-900 text-green-400 rounded overflow-auto max-h-60 text-xs font-mono">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DebugForm16Upload;
