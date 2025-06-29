import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, ExternalLink, RefreshCw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { useLiquidityManagerContext } from "./LiquidityManagerContext";

export function FinalScreen() {
  const { transactionState } = useLiquidityManagerContext();
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (transactionState.txStatus === "success") {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [transactionState.txStatus]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] py-8 relative">
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={900}
        />
      )}

      {transactionState.txStatus === "success" && (
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
          >
            <Check className="w-10 h-10 text-success" />
          </motion.div>

          <motion.h2
            className="text-2xl font-bold mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Transaction Successful!
          </motion.h2>
          
          <motion.p
            className="text-muted-foreground mb-6 max-w-md"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your transaction has been completed successfully.
          </motion.p>

          {transactionState.txHash && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => window.open(`https://basescan.org/tx/${transactionState.txHash}`, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                View on Etherscan
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}

      {transactionState.txStatus === "error" && (
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mb-6"
            initial={{ rotate: -90 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          >
            <XCircle className="w-10 h-10 text-destructive" />
          </motion.div>

          <motion.h2
            className="text-2xl font-bold mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Transaction Failed
          </motion.h2>
          
          {transactionState.errorMessage && (
            <motion.div
              className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 max-w-md"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-sm">{transactionState.errorMessage}</p>
            </motion.div>
          )}
        </motion.div>
      )}

      {transactionState.txStatus === null && (
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6"
            animate={{ rotate: 360 }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "linear"
            }}
          >
            <RefreshCw className="w-10 h-10 text-primary" />
          </motion.div>

          <motion.h2
            className="text-2xl font-bold mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Processing Transaction
          </motion.h2>
          
          <motion.p
            className="text-muted-foreground mb-6 max-w-md"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your transaction is being processed. This may take a few moments.
          </motion.p>

          {transactionState.txHash && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => window.open(`https://basescan.org/tx/${transactionState.txHash}`, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                View on Etherscan
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
} 