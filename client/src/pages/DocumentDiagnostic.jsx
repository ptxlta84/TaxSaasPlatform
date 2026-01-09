import React, { useState } from 'react';
import Button from '../components/Button/Button';
import { ShieldCheck, AlertTriangle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import DebugForm16Upload from '../components/DebugForm16Upload'; // [NEW]

// Simple page to test PDF viewing
const DocumentDiagnostic = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const runDiagnostic = async () => {
    setLoading(true);
    setTestResults([]);
    
    // Define tests
    const tests = [
      { name: 'API Connectivity', url: '/api/health' }, // assuming /api/health exists mapped to health checks
      // The instruction specifically asked for /api/documents/preview?test=1
      { name: 'Document Service (Test Mode)', url: '/api/documents/preview?test=1' },
      { name: 'Auth Check', url: '/api/auth/me' } // Verify session
    ];
    
    const results = [];
    for (const test of tests) {
      try {
        const startTime = Date.now();
        const response = await fetch(test.url); // Fetch handles relative URLs if proxy/base set, otherwise assumes same origin
        const duration = Date.now() - startTime;
        
        let data;
        let status = 'PASS';
        let error = null;

        if (response.ok) {
            try {
                data = await response.json();
            } catch (e) {
                data = { msg: 'Response OK but not JSON', text: await response.text() };
            }
        } else {
            status = 'FAIL';
            error = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        results.push({ test: test.name, status, data, error, duration });
      } catch (error) {
        results.push({ test: test.name, status: 'FAIL', error: error.message, duration: 0 });
      }
    }
    
    setTestResults(results);
    setLoading(false);
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <ShieldCheck className="text-blue-600" />
                Document Viewer Diagnostic
            </h1>
            <p className="text-gray-500">Run system checks to diagnose PDF viewing issues.</p>
        </div>
        <Button onClick={runDiagnostic} disabled={loading} className="flex items-center gap-2">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? 'Running Tests...' : 'Run Tests'}
        </Button>
      </div>
      
      <div className="space-y-4">
        {testResults.length === 0 && !loading && (
            <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
                Click "Run Tests" to start diagnostics.
            </div>
        )}

        {testResults.map((result, idx) => (
            <div key={idx} className={`p-4 rounded-lg border flex flex-col gap-2 ${
                result.status === 'PASS' 
                ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
            }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium">
                        {result.status === 'PASS' 
                            ? <CheckCircle size={20} className="text-green-600" /> 
                            : <XCircle size={20} className="text-red-600" />
                        }
                        <span className={result.status === 'PASS' ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}>
                            {result.test}
                        </span>
                    </div>
                    <span className="text-xs font-mono text-gray-500">{result.duration}ms</span>
                </div>
                
                {result.error && (
                    <div className="text-sm text-red-600 ml-7">
                        Error: {result.error}
                    </div>
                )}
                
                {result.data && (
                    <pre className="ml-7 mt-2 p-3 bg-white dark:bg-black/20 rounded text-xs font-mono overflow-x-auto border border-gray-200 dark:border-gray-700">
                        {JSON.stringify(result.data, null, 2)}
                    </pre>
                )}
            </div>
        ))}
      </div>

      {/* Form-16 Debugger */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Form-16 Debug Tools</h2>
        <DebugForm16Upload />
      </div>
    </div>
  );
};

export default DocumentDiagnostic;
