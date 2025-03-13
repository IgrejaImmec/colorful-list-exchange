
import React from 'react';
import { useLists } from '../context/ListsContext';

const PrintMode = () => {
  const { isPrinting } = useLists();
  
  if (!isPrinting) return null;
  
  return (
    <style jsx global>{`
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
    `}</style>
  );
};

export default PrintMode;
