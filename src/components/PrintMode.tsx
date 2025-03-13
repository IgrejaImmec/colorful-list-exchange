
import React, { useEffect } from 'react';
import { useLists } from '../context/ListsContext';

const PrintMode = () => {
  const { isPrinting } = useLists();
  
  useEffect(() => {
    // Add print styles when the component mounts
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @media print {
        body {
          background-color: white !important;
        }
        
        nav, header button, footer, .no-print {
          display: none !important;
        }
        
        .print-container {
          padding: 20px !important;
          max-width: 100% !important;
          margin: 0 !important;
        }
        
        h1, h2, h3, p {
          margin-bottom: 8px !important;
        }
      }
    `;
    
    if (isPrinting) {
      document.head.appendChild(styleElement);
    }
    
    // Clean up function to remove the style element when component unmounts
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [isPrinting]);
  
  return null; // This component doesn't render anything visible
};

export default PrintMode;
