export type NotificationType = 'transaction' | 'system' | 'error';

export type TransactionType = 'deposit' | 'withdraw' | 'yield';

export type ProtocolType = 'aave' | 'compound' | 'lido' | 'uniswap' | 'curve';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  transaction?: {
    type: TransactionType;
    txHash: string;
    amount: string;
    network: {
      name: string;
      explorerUrl: string;
    };
  };
} 