import React, { useState, useEffect,useRef } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import WorkFlow from "./components/Workflow"
import { PauseCircleIcon ,CheckCircleIcon} from "@heroicons/react/24/solid";
import { StreamingText } from "./components/Terminal"; 
import { colors } from "./components/Gvalues";
import { Terminal, TypingAnimation, AnimatedSpan } from "./components/Terminal";

const SOCKET_URL = "http://127.0.0.1:5000";


function App() {

  const [socket, setSocket] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [workflowUpdates, setWorkflowUpdates] = useState([]);
  const scrollRef = useRef(null);
  const contractDetails = {
  type: "Voting System",
  language: "Solidity",
  framework: "Hardhat"
};
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
      console.log(fields.length)
      if(fields.length ===0){
          newSocket.emit("inputs_response", formData);
      }
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
  }, []);
  const sendMessage = () => {
    socket.emit("prompt", { name : 'funTrunkk' ,prompt : "Create an ERC-20 token called 'TestCoin' with symbol 'TEST' and total supply of 1 million tokens" });
  };
  const handleDownload = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'output.pdf';
      link.click();
      URL.revokeObjectURL(url); // Clean up
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

  const handleSubmit = () => {
    socket.emit("inputs_response", formData);
    setFields([]);
    setFormData({});
  };

  return (
<div className="flex h-screen w-screen bg-white px-4 box-border">
  <div className="flex w-full gap-4 p-3">
    <div className="w-[20%] h-full bg-white rounded-md">
      <WorkFlow updates={updates} contractDetails={contractDetails}  />
    </div>


    <div className="w-[60%] h-full bg-gray-100 rounded-3xl shadow-lg overflow-y-auto pr-2 " ref={scrollRef}>

      <Terminal>
        {workflowUpdates.map((msg, index) => (
          <AnimatedSpan key={index} delay={300} >
            <TypingAnimation className={msg.class}>
              {msg.text}
            </TypingAnimation>
          </AnimatedSpan>
          
        ))}
        <div className="h-20"></div>
      </Terminal>
      
    </div>


    <div className="w-[20%] h-full bg-white rounded-md">
      <button onClick={sendMessage}>Send to Backend</button>
      {fields.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Enter Constructor Parameters</h2>
          {fields.map((field) => (
            <div key={field}>
              <label className="block mb-1">{field}</label>
              <input
                type="text"
                value={formData[field] || ""}
                onChange={handleChange(field)}
                className="border px-2 py-1 rounded w-full"
              />
            </div>
          ))}
          <button
            onClick={handleSubmit}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  </div>
</div>


  );
}

export default App;

