import React, { useEffect, useState } from "react";

export function Terminal({ children }) {
  return (
    <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm min-h-[200px] overflow-auto  shadow-inner flex-1 h-full">
      {children}
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

  return (
    <div 
      className={className} 
      style={{ 
        fontFamily: 'monospace', 
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        ...style 
      }}
    >
      {displayed}
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
