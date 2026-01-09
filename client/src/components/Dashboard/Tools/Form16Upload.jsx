import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, AlertCircle, Trash2 } from 'lucide-react';
import { taxService } from '../../../services/taxService';
import Form16Preview from './Form16Preview';

const Form16Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const [stage, setStage] = useState('NONE');
  
  // LOGICAL WORKFLOW FIX: Hydrate state on mount
  React.useEffect(() => {
      const fetchState = async () => {
          try {
              const income = await taxService.getIncomeDetails();
              if (income && income.form16Stage && income.form16Stage !== 'NONE') {
                   console.log('[Form16Upload] Hydrating State:', income);
                   setStage(income.form16Stage);
                   
                   // Reconstruct parsedData for Preview if Part B is already done
                   let parsedPart = 'A';
                   if (income.form16Stage.includes('PART_B')) parsedPart = 'B';
                   
                   setParsedData({
                       parsedPart,
                       form16Stage: income.form16Stage,
                       extractedData: {
                           employer: income.employer,
                           salary: income.salary, // Will be populated if Part B done
                           // TDS is not stored in income details directly in the same shape, 
                           // but for hydration purposes, we prioritize Salary display.
                           // ideally we should store TDS summary too, but for Part B view, Salary is key.
                           taxableSalary: income.grossTotalIncome // heuristic
                       },
                       __debug: {
                           msg: "Hydrated from Backend Persistence",
                           stage: income.form16Stage
                       }
                   });
              }
          } catch (err) {
              // No existing state or 404, ignore
              console.log('[Form16Upload] No existing session state found.');
          }
      };
      
      fetchState();
  }, []);

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
          // 1. Get/Create User's ITR Draft ID
          const itr = await taxService.startFiling('2024-2025');
          const itrId = itr._id;

          // 2. Upload & Parse
          const res = await taxService.uploadForm16(uploadedFile);
          
          console.log('[Form16Upload] Server Response:', res);

          // FORCE STATE UPDATE: Map 'parsed' from tax.controller to 'extractedData'
          const parsed = res.parsed;
          let newStage = stage;
          let parsedPart = 'UNKNOWN';

          // Determine stage based on what the parser found
          if (parsed.isPartA && !parsed.isPartB) {
              newStage = 'PART_A_PARSED';
              parsedPart = 'A';
          } else if (parsed.isPartB && !parsed.isPartA) {
              newStage = 'PART_B_PARSED';
              parsedPart = 'B';
          } else if (parsed.isPartA && parsed.isPartB) {
              if (stage === 'NONE') {
                  newStage = 'PART_A_PARSED';
                  parsedPart = 'A';
              } else {
                  newStage = 'CONSOLIDATED';
                  parsedPart = 'B';
              }
          }

          // --- MERGE LOGIC START ---
          const consolidated = res.consolidated;
          let displayData = parsed;

          if (consolidated && consolidated.employers.length > 0) {
               // Use the consolidated sums for display
               displayData = {
                   ...parsed,
                   employer: { 
                       ...parsed.employer, 
                       name: `Merged: ${consolidated.employers.join(' + ')}` 
                   },
                   grossSalary: consolidated.salary.gross,
                   taxableSalary: consolidated.salary.netTaxable,
                   tdsDeducted: consolidated.tds.taxDeducted,
                   // Note: keeping other breakdown fields from the latest file as 'summing' them 
                   // would require more complex mapping. For now, Totals are what matters.
               };
               newStage = 'CONSOLIDATED';
               parsedPart = 'B'; // Treat as complete
          }
          // --- MERGE LOGIC END ---

          const newData = {
              parsedPart: parsedPart,
              form16Stage: newStage,
              extractedData: displayData, 
              message: res.message,
              __debug: { msg: "Parsed via Real Regex Engine", flags: { A: parsed.isPartA, B: parsed.isPartB } } 
          };
          
          setParsedData(newData); 
          setStage(newStage);

      } catch (err) {
          console.error(err);
          // Check for specific backend error
          const msg = err.response?.data?.message || 'Upload failed. Please try again.';
          setError(msg);
          setFile(null);
      } finally {
          setLoading(false);
      }
  };

  const handleConfirm = () => {
      // Navigate to ITR filing
      navigate('/dashboard/filing');
  };

  const handleReupload = () => {
      setFile(null);
      setParsedData(null);
      // We keep 'stage' state to show correct prompt (e.g. "Upload Part B")
  };

  const handleReset = async (e) => {
    e.stopPropagation();
    if(window.confirm('Are you sure? This will delete all your uploaded Form 16s and Tax Data. This operation is for testing.')) {
        try {
            await taxService.resetData();
            setStage('NONE');
            setParsedData(null);
            setFile(null);
            alert('Data Cleared!');
        } catch(err) {
            alert('Failed to reset: ' + err.message);
        }
    }
  };

  if (parsedData) {
      return <Form16Preview data={parsedData} onConfirm={handleConfirm} onReupload={handleReupload} />;
  }
  
  // Dynamic Text based on Stage
  let uploadTitle = "Click to upload Form-16 Part A";
  let uploadSub = "TDS Certificate (First step)";
  
  if (stage === 'PART_A_PARSED') {
      uploadTitle = "Click to upload Form-16 Part B";
      uploadSub = "Salary Details (Second step)";
  } else if (stage === 'PART_B_PARSED' || stage === 'CONSOLIDATED') {
      uploadTitle = "Click to replace Form-16 Part B";
      uploadSub = "Upload new file to overwrite salary details";
  } else {
      // Default / NONE
       uploadTitle = "Click to upload Form-16 Part A";
       uploadSub = "Upload Part A first, then Part B";
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-start">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Form 16</h2>
            <p className="text-gray-500 dark:text-gray-400">Step-by-step upload for Part A (TDS) and Part B (Salary).</p>
        </div>
        <button 
           onClick={handleReset}
           className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
           title="Reset All Data (Testing)"
        >
            <Trash2 size={16} /> Reset
        </button>
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
                <p className="text-gray-600 dark:text-gray-300 font-medium">Analyzing File...</p>
                <p className="text-xs text-gray-400 mt-2">Extracting data...</p>
            </div>
        ) : (
             <label htmlFor="form16-upload" className="cursor-pointer flex flex-col items-center">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mb-4">
                    <UploadCloud size={40} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{uploadTitle}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{uploadSub}</p>
                
                <div className="flex gap-4 text-xs text-gray-400">
                    <span className={`flex items-center gap-1 ${stage === 'NONE' ? 'text-blue-600 font-bold' : ''}`}><FileText size={12}/> Part A</span>
                    <span className="text-gray-300">→</span>
                    <span className={`flex items-center gap-1 ${stage === 'PART_A_PARSED' ? 'text-blue-600 font-bold' : ''}`}><FileText size={12}/> Part B</span>
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
