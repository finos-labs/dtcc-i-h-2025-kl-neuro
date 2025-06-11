import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  CloudArrowUpIcon,
  FlagIcon
} from "@heroicons/react/24/outline";
import { LoadingSpinner } from './LoadingSpinner';

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -20 },
};

function WorkflowProcess({ updates }) {
  const isComplete = updates[updates.length - 1] === "end";
    const getStepIcon = (step, isLast, isComplete) => {
    if (isComplete) return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
    if (!isLast) return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
    
    // Special icons for processing steps
    if (step.includes("Initial")) return <LoadingSpinner size="sm" color="blue" />;
    if (step.includes("Upload")) return <CloudArrowUpIcon className="h-5 w-5 text-blue-400" />;
    if (step.includes("Process")) return <LoadingSpinner size="sm" color="purple" />;
    if (step === "end") return <FlagIcon className="h-5 w-5 text-green-400" />;
    
    return <LoadingSpinner size="sm" color="blue" />;
  };

  return (
    <div className="space-y-3 max-h-full overflow-y-auto scrollbar-hide">
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
            >
              <div className={`bg-gray-700/30 backdrop-blur-sm p-4 rounded-lg border ${
                isComplete
                  ? "border-green-500/30 bg-green-500/10" 
                  : showProcessing 
                    ? "border-blue-500/30 bg-blue-500/10" 
                    : "border-green-500/30 bg-green-500/10"
              } transition-all duration-300`}>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getStepIcon(step, isLast, isComplete)}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-200 font-medium text-sm">
                      {step === "end" ? "✨ Process completed" : step}
                    </p>                    {showProcessing && (
                      <div className="flex items-center gap-2 mt-2">
                        <LoadingSpinner size="sm" color="blue" />
                        <span className="text-xs text-blue-400 animate-pulse">Processing...</span>
                      </div>
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