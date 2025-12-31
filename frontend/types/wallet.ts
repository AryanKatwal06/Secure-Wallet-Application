export interface User {
  userId: string;
  username: string;
  walletBalance: number;
  bankBalance: number;
}
export interface Transaction {
  transactionId: string;
  type: 'ADD_MONEY' | 'WITHDRAW' | 'TRANSFER';
  senderId: string;
  receiverId?: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: number;
  completedAt?: number;
}
export interface AuthResponse {
  success: boolean;
  message?: string;
  userId?: string;
  token?: string;
  username?: string;
  walletBalance?: number;
  bankBalance?: number;
}
export interface TransactionResponse {
  success: boolean;
  message?: string;
  transactionId?: string;
  newBalance?: number;
}
export interface BalanceResponse {
  success: boolean;
  walletBalance?: number;
  bankBalance?: number;
}
export interface TransactionHistoryResponse {
  success: boolean;
  transactions: Transaction[];
}
export interface OfflineTransaction {
  clientTransactionId: string;
  type: 'TRANSFER';
  receiverId: string;
  receiverUsername: string;
  amount: number;
  clientTimestamp: number;
  signature: string;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
}
export interface SyncedTransaction {
  clientTransactionId: string;
  serverTransactionId: string;
  type: string;
  amount: number;
  newBalance: number;
}
export interface SyncFailure {
  clientTransactionId: string;
  type: string;
  amount: number;
  reason: string;
}
export interface SyncResponse {
  success: boolean;
  message?: string;
  syncedTransactions?: SyncedTransaction[];
  failures?: SyncFailure[];
}