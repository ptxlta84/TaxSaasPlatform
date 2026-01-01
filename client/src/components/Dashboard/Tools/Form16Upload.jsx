import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';
import { taxService } from '../../../services/taxService';
import Form16Preview from './Form16Preview';

const Form16Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (uploadedFile) => {
      // Validate Type
      if (!uploadedFile.type.includes('pdf') && !uploadedFile.type.includes('image')) {
          setError('Please upload a PDF or Image file.');
          return;
      }
      
      setFile(uploadedFile);
      setLoading(true);
      setError('');
      
      try {
          const res = await taxService.uploadForm16(uploadedFile);
          // Backend returns { message, data (saved DB obj), parsed (raw data) }
          // We use 'parsed' for preview as it matches our schema
          setParsedData(res.parsed); 
      } catch (err) {
          setError('Failed to parse file. Please try again.');
          console.error(err);
          setFile(null);
      } finally {
          setLoading(false);
      }
  };

  const handleConfirm = () => {
      // Navigate to ITR filing
      // ideally we pass the parsed data ID or save it to context
      navigate('/dashboard/filing');
  };

  const handleReupload = () => {
      setFile(null);
      setParsedData(null);
  };

  if (parsedData) {
      return <Form16Preview data={parsedData} onConfirm={handleConfirm} onReupload={handleReupload} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Form 16</h2>
        <p className="text-gray-500 dark:text-gray-400">Upload your Form 16 (Part A & B) and we'll auto-fill your tax return details.</p>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
            dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
            type="file" 
            id="form16-upload" 
            className="hidden" 
            onChange={handleChange} 
            accept=".pdf,image/*"
        />
        
        {loading ? (
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Analyzing your Form 16...</p>
                <p className="text-xs text-gray-400 mt-2">Extracting Salary, TDS, and Employer details</p>
            </div>
        ) : (
             <label htmlFor="form16-upload" className="cursor-pointer flex flex-col items-center">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mb-4">
                    <UploadCloud size={40} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Click to upload or drag and drop</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">PDF, PNG or JPG (Max 5MB)</p>
                
                <div className="flex gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><FileText size={12}/> Part A (TDS)</span>
                    <span className="flex items-center gap-1"><FileText size={12}/> Part B (Salary)</span>
                </div>
            </label>
        )}
        
        {error && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center text-red-500 text-sm font-medium items-center gap-2">
                <AlertCircle size={16} /> {error}
            </div>
        )}
      </div>
      
      <div className="mt-8 grid md:grid-cols-3 gap-6">
          {[
              { title: 'Secure & Private', desc: 'Your data is encrypted and only visible to you.' },
              { title: 'Instant Parsing', desc: 'AI-powered engine extracts data in seconds.' },
              { title: '100% Accuracy', desc: 'Auto-checks calculations against tax rules.' }
          ].map((feature, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
              </div>
          ))}
      </div>
    </div>
  );
};

export default Form16Upload;
