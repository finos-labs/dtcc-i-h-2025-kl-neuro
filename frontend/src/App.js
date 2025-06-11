import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import WorkFlow from "./components/Workflow"
import { CodeBracketIcon, RocketLaunchIcon } from "@heroicons/react/24/solid";
import { Terminal, TypingAnimation, AnimatedSpan } from "./components/Terminal";

const SOCKET_URL = "http://127.0.0.1:5000";


function App() {

  const [socket, setSocket] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [workflowUpdates, setWorkflowUpdates] = useState([]);
  const [contractName, setContractName] = useState("");
  const [contractPrompt, setContractPrompt] = useState("");
  const [showPromptOnly, setShowPromptOnly] = useState(false);
  const scrollRef = useRef(null);

  const handleDownload = useCallback(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'output.pdf';
      link.click();
      URL.revokeObjectURL(url); // Clean up
    }
  }, [pdfBlob]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [workflowUpdates]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      upgrade: false,
      forceNew: true,
      
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      

      pingTimeout: 60000 * 60,
      pingInterval: 15000,
      

      timeout: 60000,
      autoConnect: true,
      query: {
        keepalive: "true",
        clientType: "web"
      }
    });

    newSocket.on("connect", () => {
      console.log(" Connected");
      startKeepalive(newSocket);
    });

    newSocket.on("disconnect", (reason) => {
      console.log(" Disconnected:", reason);
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    });

    newSocket.on("reconnect", (attempt) => {
      console.log(` Reconnected (attempt ${attempt})`);
    });

    // keepalive acknowledgement
    newSocket.on("keepalive", () => {
      console.debug(" Keepalive acknowledged");
    });
    newSocket.on("update",(data)=>{
        setUpdates(prevItems => [...prevItems, data['data']]);
        console.log(data['data'])
    })
    newSocket.on("workflow",(data)=>{
        setWorkflowUpdates(prevItems => [...prevItems, {text : data['data'],class : ""}]);
        console.log(data['data'])
    })
    newSocket.on("workflowt",(data)=>{
        setWorkflowUpdates(prevItems => [...prevItems, {text : data['data'],class : "text-red-500"}]);
        console.log(data['data'])
    })
    newSocket.on("request_inputs", (data) => {
      console.log(data.data.fields)
      setFields(data.data.fields);
      if(fields.length===0){
        newSocket.emit("inputs_response", {});     }
    });
    


    

    newSocket.on("file", (data) => {
      const base64PDF = data;

      const byteCharacters = atob(base64PDF);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      const blob = new Blob([byteArray], { type: 'application/pdf' });
      setPdfBlob(blob);
      handleDownload()
    });

    setSocket(newSocket);
    

    

    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("reconnect");
      newSocket.off("keepalive");
      newSocket.off("r");
      newSocket.disconnect();
    };
  }, [handleDownload]);
  const sendMessage = () => {
    if (contractName.trim() && contractPrompt.trim()) {
      socket.emit("prompt", { name: contractName.trim(), prompt: contractPrompt.trim() });
      setShowPromptOnly(true);
    }
  };
  
  const startKeepalive = (socket) => {
    // Combined keepalive strategy
    const keepaliveInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("keepalive", { 
          timestamp: Date.now(),
          client: "web-ui"
        }); 
        

        if (!socket.connected) {
          socket.connect();
        }
      }
    }, 30000);

    return () => clearInterval(keepaliveInterval);
  };
  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleSubmit = () => {
    socket.emit("inputs_response", formData);
    setFields([]);
    setFormData({});
  };

  return (
<div className="flex h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
  {/* Header */}
  <div className="absolute top-0 left-0 right-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 relative">
                <div className="absolute inset-0 bg-white rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full opacity-90 flex items-center justify-center">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                </div>
                <div className="absolute top-2 right-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
                <div className="absolute bottom-1 left-2 w-1 h-1 bg-white rounded-full opacity-60"></div>
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white tracking-tight">KL  N E U R O</h1>
            <span className="text-xs text-gray-400 font-medium">Smart Contract Creation</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div className="text-xs text-gray-500">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  </div>

  {/* Main Content */}
  <div className="flex w-full gap-6 p-6 pt-24 pb-16">
    {/* Workflow Panel */}
    <div className="w-[25%] h-full">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 h-full shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 bg-blue-500 rounded-full animate-pulse"></div>
          <h2 className="text-lg font-semibold text-white">Workflow Status</h2>
        
        </div>
        <WorkFlow updates={updates} />
      </div>
    </div>


    <div className="w-[50%] h-full">
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 font-mono">Execution Log</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500">
              {workflowUpdates.length} logs
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          <Terminal>
            {workflowUpdates.map((msg, index) => (
              <AnimatedSpan key={index} delay={300}>
                <TypingAnimation className={msg.class}>
                  {msg.text}
                </TypingAnimation>
              </AnimatedSpan>
            ))}
            <div className="h-20"></div>
          </Terminal>
        </div>
      </div>
    </div>

    <div className="w-[25%] h-full">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 h-full shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 bg-purple-500 rounded-full animate-pulse"></div>
          <h2 className="text-lg font-semibold text-white">Controls</h2>
        </div>
        
        {!showPromptOnly ? (
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Contract Name</label>
              <input
                type="text"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter contract name..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Contract Prompt</label>
              <textarea
                value={contractPrompt}
                onChange={(e) => setContractPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Describe your smart contract..."
                rows="3"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-medium text-gray-300">Contract Prompt</label>
            <textarea
              value={contractPrompt}
              onChange={(e) => setContractPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Describe your smart contract..."
              rows="3"
            />
          </div>
        )}
        
        <button 
          onClick={sendMessage}
          disabled={!contractName.trim() || !contractPrompt.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg mb-6 flex items-center justify-center gap-2 group"
        >
          <CodeBracketIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Generate Smart Contract
        </button>

        {fields.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-700 flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce"></div>
              Constructor Parameters
            </h3>
            {fields.map((field, index) => (
              <motion.div 
                key={field} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-300">{field}</label>
                <input
                  type="text"
                  value={formData[field] || ""}
                  onChange={handleChange(field)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={`Enter ${field}...`}
                />
              </motion.div>
            ))}
            <button
              onClick={handleSubmit}
              className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 group"
            >
              <RocketLaunchIcon className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
              Deploy Contract
            </button>
          </motion.div>
        )}
      </div>
    </div>
  </div>

  {/* Status Bar */}
  <div className="absolute bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 px-6 py-2">
    <div className="flex items-center justify-between text-xs text-gray-400">
      <div className="flex items-center gap-4">
        <span>KL University</span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          Ready
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>Solidity ^0.8.0</span>
        <span>•</span>
        <span>Hardhat Network</span>
        <span>•</span>
      </div>
    </div>
  </div>
</div>


  );
}

export default App;

