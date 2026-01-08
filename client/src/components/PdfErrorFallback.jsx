import React from 'react';
import { AlertCircle, Download, ExternalLink, RefreshCw } from 'lucide-react';
import Button from './Button/Button';

const PdfErrorFallback = ({ error, onRetry, downloadUrl, fileName }) => {
  const googleDocsViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(downloadUrl)}&embedded=true`;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Unable to load document preview
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
        {error || "We encountered an issue displaying this PDF. This might be due to network restrictions or browser settings."}
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw size={16} /> Retry
          </Button>
        )}
        
        {downloadUrl && (
          <a href={downloadUrl} download={fileName || "document.pdf"} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="flex items-center gap-2">
              <Download size={16} /> Download Original
            </Button>
          </a>
        )}

        {downloadUrl && (
           <a href={googleDocsViewerUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" className="flex items-center gap-2">
               <ExternalLink size={16} /> Open in Google Viewer
            </Button>
           </a>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 w-full">
         <p className="text-xs text-gray-400 font-mono text-left">
            Diagnostic: {fileName ? `File: ${fileName}` : 'Unknown File'}
         </p>
      </div>
    </div>
  );
};

export default PdfErrorFallback;
