import { ProtocolType, TransactionType } from '@/types/notifications';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Generic transaction creation
export const createTransaction = async (
  userAddress: string, 
  type: TransactionType, 
  amount: number, 
  protocol?: ProtocolType,
  networkId?: number,
  txHash?: string,
  fromAddress?: string,
  toAddress?: string,
  tokenAddress?: string,
  tokenDecimals?: number,
  isCCIP?: boolean,
) => {
  try {
    const endpoint = `${API_BASE_URL}/transactions/${type}`;
    const response = await axios.post(endpoint, { 
      userAddress,
      amount, 
      protocol,
      networkId,
      txHash,
      fromAddress,
      toAddress,
      tokenAddress,
      tokenDecimals,
      isCCIP,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

// Transaction API calls
export const createDeposit = async (userId: string, amount: number, protocol: string, networkId?: number) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/transactions/deposit`, { userId, amount, protocol, networkId });
    return response.data;
  } catch (error) {
    console.error('Error creating deposit:', error);
    throw error;
  }
};

export const createWithdrawal = async (userId: string, amount: number, protocol: string, networkId?: number) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/transactions/withdraw`, { userId, amount, protocol, networkId });
    return response.data;
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    throw error;
  }
};

export const getTransactionsByUser = async (userId: string, networkId?: number) => {
  try {
    const params: Record<string, string | number> = {};
    if (networkId) {
      params.networkId = networkId;
    }
    
    const response = await axios.get(`${API_BASE_URL}/transactions/${userId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const getTransactionHistory = async (userId: string, fromDate?: Date, toDate?: Date, networkId?: number) => {
  try {
    let url = `${API_BASE_URL}/transactions/${userId}/history`;
    const params: Record<string, string | number> = {};
    
    if (fromDate) {
      params.from = fromDate.toISOString();
    }
    
    if (toDate) {
      params.to = toDate.toISOString();
    }
    
    if (networkId) {
      params.networkId = networkId;
    }
    
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
};

// APY API calls
export const getApyHistory = async (protocol?: string, networkId?: number) => {
  try {
    let url = `${API_BASE_URL}/transactions/apy/history`;
    const params: Record<string, string | number> = {};
    
    if (protocol) {
      params.protocol = protocol;
    }
    
    if (networkId) {
      params.networkId = networkId;
    }
    
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching APY history:', error);
    throw error;
  }
};

// On-chain data API calls
export const getOnChainBalances = async (address: string, networkId?: number) => {
  try {
    let url = `${API_BASE_URL}/onchain/balances/${address}`;
    const params: Record<string, string | number> = {};
    
    if (networkId) {
      params.networkId = networkId;
    }
    
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching on-chain balances:', error);
    throw error;
  }
};

// On-chain data API calls
export const getPoolPositions = async (address: string, networkId?: number) => {
  try {
    let url = `${API_BASE_URL}/transactions/pool-positions/${address}`;
    const params: Record<string, string | number> = {};
    
    if (networkId) {
      params.networkId = networkId;
    }
    
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching on-chain balances:', error);
    throw error;
  }
};

// Network API calls
export const getAllNetworks = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/networks`);
    return response.data;
  } catch (error) {
    console.error('Error fetching networks:', error);
    throw error;
  }
};

export const getNetworkById = async (id: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/networks/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching network:', error);
    throw error;
  }
};

export const getNetworkByChainId = async (chainId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/networks/chain/${chainId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching network by chain ID:', error);
    throw error;
  }
};

// Get unread notifications
export const getUnreadNotifications = async (userId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications/${userId}/unread`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: number) => {
  try {
    await axios.post(`${API_BASE_URL}/notifications/${notificationId}/mark-read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    await axios.post(`${API_BASE_URL}/notifications/${userId}/mark-all-read`);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}; 