import React, { useState, useEffect } from 'react';
import { UploadCloud, File, Trash, Eye, Download, FileText } from 'lucide-react';
import { taxService } from '../../../services/taxService';
import Button from '../../Button/Button';

const DocumentVault = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [currentItrId, setCurrentItrId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            // using startFiling to get the current draft ITR which holds documents
            const itr = await taxService.startFiling('2024-2025');
            setCurrentItrId(itr._id);
            setDocuments(itr.documents || []);
        } catch (err) {
            console.error("Failed to fetch docs", err);
            setError("Could not load documents.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!currentItrId) {
            setError("No active tax return found.");
            return;
        }

        try {
            setUploading(true);
            setError('');
            const res = await taxService.uploadDocument(currentItrId, file, 'general_doc');
            // Backend returns { message, documents: [...], newlyUploaded }
            if (res.documents) {
                setDocuments(res.documents);
            } else {
                // Fallback catch-all
                fetchDocuments();
            }
        } catch (err) {
            setError("Upload failed. Pleae try again.");
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading your secure vault...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Document Vault</h2>
                    <p className="text-gray-500 dark:text-gray-400">Securely store your tax-related documents.</p>
                </div>
                <div>
                     <input 
                        type="file" 
                        id="vault-upload" 
                        className="hidden" 
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    <label htmlFor="vault-upload">
                        <Button 
                            as="span" 
                            className="cursor-pointer" 
                            isLoading={uploading} 
                            icon={UploadCloud}
                        >
                            Upload Document
                        </Button>
                    </label>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.length === 0 ? (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                        <FileText size={48} className="mb-4 opacity-50"/>
                        <p>No documents found.</p>
                        <p className="text-sm">Upload Form 16, Investment Proofs, or Challans.</p>
                    </div>
                ) : (
                    documents.map((doc, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between group">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                    <File size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-medium text-gray-900 dark:text-white truncate" title={doc.fileName}>{doc.fileName || 'Untitled Document'}</h4>
                                    <p className="text-xs text-gray-500 capitalize">{doc.category.replace('_', ' ')}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}</p>
                                </div>
                            </div>
                            
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                                <a 
                                    href={doc.fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="View"
                                >
                                    <Eye size={18} />
                                </a>
                                {/* Delete could be added here if backend supports it */}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DocumentVault;
