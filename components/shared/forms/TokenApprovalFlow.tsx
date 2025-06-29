import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/hooks";
import { ethers } from "ethers";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const BASE_NATIVE_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

interface TokenApprovalFlowProps {
  chainId: number;
  fromAddress: string;
  tokenAddress: string;
  amount: string;
  readableAmount?: string;
  onApprovalComplete: () => void;
  onApprovalError: (error: Error) => void;
  isApproved: boolean;
  setIsApproved: (approved: boolean) => void;
}
const formatTokenAddress = (address: string) => {
  if (!address) return "";

  // Check if it's ETH
  if (address.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
    return "ETH";
  }

  // Shorten other addresses
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

export function TokenApprovalFlow({
  chainId,
  fromAddress,
  tokenAddress,
  amount,
  readableAmount,
  onApprovalComplete,
  onApprovalError,
  isApproved,
  setIsApproved,
}: TokenApprovalFlowProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);
  const [approvalData, setApprovalData] = useState<{spender: string, amount: string} | null>(null);
  const { signer } = useWeb3();

  const checkAllowance = async () => {
    if (!signer || !approvalData) return;
    
    try {
      setIsCheckingAllowance(true);
      
      // Create a contract using the signer as provider
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function allowance(address owner, address spender) view returns (uint256)"],
        signer.provider || signer
      );

      try {
        const currentAllowance = await tokenContract.allowance(fromAddress, approvalData.spender);
        const requiredAmount = ethers.BigNumber.from(approvalData.amount);
        // Check if current allowance is enough
        if (currentAllowance.gte(requiredAmount)) {
          setIsApproved(true);
          return true;
        } else {
          setIsApproved(false);
          return false;
        }
      } catch (error) {
        // If the allowance check fails, assume approval is needed
        console.warn("Allowance check failed, assuming approval needed:", error);
        setIsApproved(false);
        return false;
      }
    } catch (error) {
      console.error("Error checking allowance:", error);
      setIsApproved(false);
      return false;
    } finally {
      setIsCheckingAllowance(false);
    }
  };

  const handleApproval = async () => {
    if (!signer) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      if(await checkAllowance()) return;
      setIsApproving(true);

      if (!approvalData) return;

      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function approve(address spender, uint256 amount) returns (bool)"],
        signer
      );

      try {
        const tx = await tokenContract.approve(
          approvalData.spender,
          approvalData.amount
        );

        await tx.wait();

        setIsApproved(true);
        toast.success("Token approval successful");
        onApprovalComplete();
      } catch (error) {
        console.error("Approval transaction failed:", error);
        toast.error("Failed to approve token. The token might not support standard ERC20 approval.");
        onApprovalError(error as Error);
      }
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Failed to approve token");
      onApprovalError(error as Error);
    } finally {
      setIsApproving(false);
    }
  };

  async function getApprovalData() {
    const response = await fetch("/api/transactions/approval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chainId,
        fromAddress,
        tokenAddress,
        amount,
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }

    setApprovalData(result.data);
    return result.data;
  }
  
  useEffect(() => {
    if (tokenAddress.toLowerCase() === BASE_NATIVE_ADDRESS.toLowerCase()) {
      setIsApproved(true);
    } else {
      const fetchData = async () => {
        const data = await getApprovalData();
        if (data) {
          await checkAllowance();
        }
      };
      
      fetchData();
    }
  }, [tokenAddress]);
  // If it's the native token, no approval needed

  return tokenAddress.toLowerCase() === BASE_NATIVE_ADDRESS.toLowerCase() ? (
    <></>
  ) : (
    <div className="mb-3 pb-3 pt-3 border-b border-border/40">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">Begin</span>
        <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {"ERC-20 APPROVAL"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-sm">
            Approval
            <span className="text-muted-foreground text-xs">
              {"• "}
              {amount}
              {" → "}
              {formatTokenAddress(tokenAddress)}
            </span>
          </div>
        </div>
        {!isApproved && (
          <Button
            onClick={handleApproval}
            disabled={isApproving || isCheckingAllowance || isApproved || !approvalData}
            variant={isApproved ? "outline" : "default"}
            size="sm"
          >
            {isApproving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Approving...
              </>
            ) : isCheckingAllowance ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : !approvalData ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Approve"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
