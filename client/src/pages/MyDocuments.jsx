import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Eye, Download, Search } from 'lucide-react';
import api from '../services/authService'; // Assuming default axios instance
import PdfErrorFallback from '../components/PdfErrorFallback';
import DocumentViewer from '../components/DocumentViewer'; // [NEW]
import Button from '../components/Button/Button';

const MyDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [_error, setError] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/tax/documents'); // Fixed: Uses tax routes endpoint
            setDocuments(res.data);
            if (res.data.length > 0) {
                 setSelectedDoc(res.data[0]);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch documents.');
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentClick = (doc) => {
        // CLIENT-SIDE FIX: Ensure URL has version number if missing
        let url = doc.originalUrl;
        if (url && url.includes('cloudinary.com') && !url.includes('/v1') && !url.includes('/v2')) {
            const version = 'v' + Math.floor(Date.now() / 1000);
            url = url.replace('image/upload/', `image/upload/${version}/`);
        }
        
        // Update selected doc with fixed URL
        setSelectedDoc({ ...doc, originalUrl: url });
    };



    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
            <div className="mb-6 flex justify-between items-center">
                <div>
                   <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Documents</h1>
                   <p className="text-gray-500 text-sm">Manage and view your ITR archives and uploaded proofs.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchDocuments}>Refresh</Button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                {/* Document List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search documents..." 
                                className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading && <p className="p-4 text-center text-gray-500">Loading documents...</p>}
                        
                        {!loading && documents.length === 0 && (
                            <div className="p-8 text-center">
                                <FileText className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-gray-500 text-sm">No documents found.</p>
                            </div>
                        )}

                        {documents.map(doc => (
                            <div 
                                key={doc._id}
                                onClick={() => handleDocumentClick(doc)}
                                className={`p-4 rounded-lg cursor-pointer transition-all border ${
                                    selectedDoc?._id === doc._id 
                                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-750 border-transparent'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        doc.category === 'form16' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 dark:text-white truncate" title={doc.fileName}>
                                            {doc.category === 'form16' ? 'Form 16' : doc.fileName}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <span className="flex items-center gap-1"><Calendar size={12}/> {doc.financialYear}</span>
                                            <span>•</span>
                                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    {selectedDoc?._id === doc._id && <Eye size={16} className="text-blue-500" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview Pane */}
                <div className="lg:col-span-2 bg-gray-900 rounded-xl shadow-lg border border-gray-700 overflow-hidden flex flex-col relative">
                    {selectedDoc ? (
                         <div className="flex-1 w-full h-full"> 
                             {/* Pass ORIGINAL URL - DocumentViewer handles proxy generation logic */}
                             <DocumentViewer 
                                documentUrl={selectedDoc.originalUrl} 
                                documentName={selectedDoc.fileName}
                             />
                         </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <FileText size={48} className="mb-4 opacity-50" />
                            <p>Select a document to preview</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyDocuments;
