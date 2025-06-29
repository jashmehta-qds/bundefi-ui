import { PoolPosition } from "@/lib/contexts";

export type LiquidityAction = "add" | "remove";

export interface LiquidityManagerProps {
  existingPosition?: PoolPosition;
  setOpen: (open: boolean) => void;
  action: LiquidityAction;
}

export interface Asset {
  symbol: string;
  name: string;
  address: string;
  decimals?: number;
  value?: number;
  rawBalance?: string;
}

export interface Position {
  symbol: string;
  name: string;
  address: string;
  balance: string;
  decimals?: number;
  value?: number;
}

export interface TransactionState {
  txStatus: "success" | "error" | null;
  txHash: string | null;
  errorMessage: string | null;
}
