import React from 'react';

const DocumentViewer = ({ documentUrl, documentName }) => {
  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white truncate max-w-[70%]">{documentName}</h3>
        <a 
          href={documentUrl} 
          download 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-2"
        >
          ⬇ Download PDF
        </a>
      </div>
      
      <div className="flex-1 w-full bg-gray-50 dark:bg-gray-900 relative">
        <iframe
          src={documentUrl}
          title={documentName}
          className="w-full h-full border-none"
        />
      </div>
      
      <div className="p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500">
        <p>If PDF doesn't display, <a href={documentUrl} download className="text-blue-600 hover:underline">download it here</a></p>
      </div>
    </div>
  );
};

export default DocumentViewer;
