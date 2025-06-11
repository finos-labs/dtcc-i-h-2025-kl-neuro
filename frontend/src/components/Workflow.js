import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ArrowPathIcon,
  CogIcon,
  CloudArrowUpIcon,
  FlagIcon
} from "@heroicons/react/24/outline";

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -20 },
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

function WorkflowProcess({ updates, contractDetails }) {
  const isComplete = updates[updates.length - 1] === "end";
  
  const getStepIcon = (step, isLast, isComplete) => {
    if (isComplete) return (
      <motion.div animate={pulseAnimation}>
        <CheckCircleIcon className="h-6 w-6 text-green-500" />
      </motion.div>
    );
    if (!isLast) return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    
    if (step.includes("Initial")) return (
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <CogIcon className="h-6 w-6 text-blue-500" />
      </motion.div>
    );
    if (step.includes("Upload")) return <CloudArrowUpIcon className="h-6 w-6 text-blue-500" />;
    if (step.includes("Process")) return (
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
        <ArrowPathIcon className="h-6 w-6 text-blue-500" />
      </motion.div>
    );
    if (step === "end") return <FlagIcon className="h-6 w-6 text-green-500" />;
    
    return (
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <CogIcon className="h-6 w-6 text-blue-500" />
      </motion.div>
    );
  };

  return (
    <div className="space-y-4 p-6 max-w-md mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg">
      {contractDetails && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Contract Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{contractDetails.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Language</p>
              <p className="font-medium">{contractDetails.language}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Framework</p>
              <p className="font-medium">{contractDetails.framework}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{isComplete ? "Completed" : "In Progress"}</p>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {updates.map((step, idx) => {
          const isLast = idx === updates.length - 1;
          const showProcessing = isLast && !isComplete;
          
          return (
            <motion.div
              key={`${step}-${idx}`}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={stepVariants}
              transition={{ duration: 0.4, ease: "easeOut" }}
              whileHover={{ scale: 1.02 }}
              layout
            >
              <div className={`p-5 rounded-xl shadow-sm border-l-4 ${
                isComplete 
                  ? "border-green-400 bg-gradient-to-r from-green-50 to-white" 
                  : showProcessing 
                    ? "border-blue-400 bg-gradient-to-r from-blue-50 to-white" 
                    : "border-green-400 bg-gradient-to-r from-green-50 to-white"
              }`}>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getStepIcon(step, isLast, isComplete)}
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium text-lg">
                      {step === "end" ? "Process completed successfully!" : step}
                    </p>
                    {showProcessing && (
                      <motion.p 
                        className="text-blue-600 text-sm mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        Processing your request...
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default WorkflowProcess;