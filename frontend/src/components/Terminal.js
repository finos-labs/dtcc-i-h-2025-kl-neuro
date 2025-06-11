import React, { useEffect, useState } from "react";

export function Terminal({ children }) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm p-6 font-mono text-sm min-h-[200px] overflow-auto h-full text-gray-100 relative">
      {/* Terminal Header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-green-400">➜</span> 
        <span className="text-blue-400 ml-2">smart-contract-studio</span>
        
      </div>
      
      {/* Terminal Content */}
      <div className="space-y-3 pb-4">
        {children}
      </div>
      
      {/* Cursor */}
      {/* <div className="flex items-center">
        <span className="text-green-400">➜</span>
        <span className="text-blue-400 ml-2">smart-contract-studio</span>
        <span className="text-gray-500 ml-2">git:(main)</span>
        <span className="text-yellow-400 ml-2">✗</span>
        <span className="ml-2 bg-gray-100 w-2 h-4 animate-pulse"></span>
      </div> */}
    </div>
  );
}

export function TypingAnimation({ children, delay = 0, className = "", style = {} }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    // Reset state when children change
    setDisplayed("");

    const text = typeof children === 'string' ? children : String(children || '');

    const timeout = setTimeout(() => {
      setDisplayed(text); // Immediately display full text after delay
    }, delay);

    return () => clearTimeout(timeout);
  }, [children, delay]);

  // Simple syntax highlighting for Solidity and common terms
  const highlightText = (text) => {
    if (!text) return text;
    
    // Check if it looks like Solidity code
    if (text.includes('contract') || text.includes('function') || text.includes('pragma')) {
      return (
        <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-3 my-2">
          <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Solidity Code
          </div>
          <pre className="text-green-400 text-sm">{text}</pre>
        </div>
      );
    }
    
    return text;
  };

  return (
    <div 
      className={`${className} text-gray-100 leading-relaxed border-l-2 border-blue-500/30 pl-3 py-1`}
      style={{ 
        fontFamily: 'Fira Code, Consolas, Monaco, monospace', 
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        ...style 
      }}
    >
      <div className="flex items-start gap-2">
        <span className="text-gray-500 text-xs mt-1">$</span> 
        <div className="flex-1">
          {typeof displayed === 'string' && (displayed.includes('contract') || displayed.includes('function')) 
            ? highlightText(displayed)
            : displayed
          }
        </div>
      </div>
    </div>
  );
}


export function AnimatedSpan({ children, delay = 0, className = "" }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);
  return show ? <div className={className}>{children}</div> : null;
}
